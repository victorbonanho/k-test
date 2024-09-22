import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Client from "../models/clientModel";
import { IClient } from "../models/clientModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerClient, loginClient } from "../controllers/authController";
import { chatWithClient, askChatGPT } from "../controllers/chatController";
import { verifyToken } from "../middlewares/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;
const app = express();
app.use(bodyParser.json());

// Definindo as rotas para o teste
app.post("/api/register", registerClient);
app.post("/api/login", loginClient);
app.post("/api/chat", verifyToken, chatWithClient);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Client Integration", () => {
  let clientId: string;
  let token: string;

  beforeEach(async () => {
    const connection = mongoose.connection;

    if (connection.readyState !== 1) {
      await new Promise<void>((resolve) => connection.once("open", resolve));
    }

    if (!connection.db) {
      throw new Error("Database connection is not established");
    }

    const collections = await connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }

    const client: IClient = new Client({
      name: "João",
      email: "joao@example.com",
      phone: "123456789",
      password: await bcrypt.hash("senha123", 10),
    });
    const savedClient = (await client.save()) as IClient;

    clientId = (savedClient._id as mongoose.Types.ObjectId).toString();

    token = jwt.sign({ id: clientId }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
  });

  describe("Registration", () => {
    it("should register a new client", async () => {
      const response = await request(app).post("/api/register").send({
        name: "Maria",
        email: "maria@example.com",
        phone: "987654321",
        password: "senha123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Cliente registrado com sucesso.",
      });

      const newClient = await Client.findOne({ email: "maria@example.com" });
      expect(newClient).toBeTruthy();
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Todos os campos são obrigatórios.",
        })
      );
    });

    it("should return 409 if email is already registered", async () => {
      const response = await request(app).post("/api/register").send({
        name: "João",
        email: "joao@example.com",
        phone: "123456789",
        password: "senha123",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Email já cadastrado." })
      );
    });
  });

  describe("Login", () => {
    it("should login a client and return a token", async () => {
      const response = await request(app).post("/api/login").send({
        email: "joao@example.com",
        password: "senha123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ email: "joao@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Email e senha são obrigatórios." })
      );
    });

    it("should return 401 if credentials are invalid", async () => {
      const response = await request(app).post("/api/login").send({
        email: "joao@example.com",
        password: "senhaErrada",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Credenciais inválidas." })
      );
    });
  });

  describe("Chat with Client", () => {
    it("should return 400 if question is missing", async () => {
      const response = await request(app)
        .post(`/api/chat`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Pergunta é obrigatória." })
      );
    });

    it("should return 401 if token not found", async () => {
      const fakeToken = jwt.sign({ id: "invalidId" }, "fail", {
        expiresIn: "1h",
      });

      const response = await request(app)
        .post(`/api/chat`)
        .set("Authorization", `Bearer ${fakeToken}`)
        .send({ question: "Qual é a capital da França?" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Token inválido." })
      );
    });

    it("should return 500 if there is an error in processing", async () => {
      jest
        .spyOn(Client, "findById")
        .mockRejectedValueOnce(new Error("Erro inesperado"));

      const response = await request(app)
        .post(`/api/chat`)
        .set("Authorization", `Bearer ${token}`)
        .send({ question: "Qualquer pergunta?" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Erro ao processar a requisição." })
      );
    });

    it("should return 404 if client not found", async () => {
      const fakeToken = jwt.sign(
        { _id: "invalidId" },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      const response = await request(app)
        .post(`/api/chat`)
        .set("Authorization", `Bearer ${fakeToken}`)
        .send({ question: "Qual é a capital da França?" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Cliente não encontrado." })
      );
    });

    it("should process chat and return the answer", async () => {
      const mockAnswer = "Paris";
      jest.spyOn({ askChatGPT }, "askChatGPT").mockResolvedValue(mockAnswer);

      const response = await request(app)
        .post(`/api/chat`)
        .set("Authorization", `Bearer ${token}`)
        .send({ question: "Qual é a capital da França?" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        question: "Qual é a capital da França?",
        answer: expect.any(String),
      });

      const updatedClient = await Client.findById(clientId);
      expect(updatedClient?.chatHistory).toHaveLength(1);
      expect(updatedClient?.chatHistory[0]).toEqual(
        expect.objectContaining({
          question: "Qual é a capital da França?",
          answer: expect.any(String),
          timestamp: expect.any(Date),
        })
      );
    });
  });
});
