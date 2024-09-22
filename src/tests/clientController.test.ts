import dotenv from "dotenv";

dotenv.config();

import { loginClient, registerClient } from "../controllers/authController";
import { chatWithClient, askChatGPT } from "../controllers/chatController";
import { Request, Response } from "express";
import Client from "../models/clientModel";
import bcrypt from "bcryptjs";

process.env.JWT_SECRET = "fakeSecret";
process.env.DB_URL = "mongodb://localhost:27017/fakeDB";

jest.mock("../models/clientModel");

jest.mock("../controllers/authController", () => ({
  ...jest.requireActual("../controllers/authController"),
  register: jest.fn(),
}));

jest.mock("../controllers/chatController", () => ({
  ...jest.requireActual("../controllers/chatController"),
  askChatGPT: jest.fn(),
}));

describe("registerClient Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      body: {
        name: "João",
        email: "joao@example.com",
        phone: "123456789",
        password: "senha123",
      },
    };
    res = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it("should register a new client", async () => {
    (Client.findOne as jest.Mock).mockResolvedValue(null);

    const mockSave = jest.fn().mockResolvedValue({
      _id: "66eef792e41349bd812f5bc7",
      ...req.body,
    });
    (Client.prototype.save as jest.Mock).mockImplementation(mockSave);

    jest
      .spyOn(bcrypt, "hash")
      .mockImplementation(
        async (password: string, salt: string | number): Promise<string> => {
          return "hashedPassword";
        }
      );

    await registerClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Cliente registrado com sucesso.",
    });
  });

  it("should return 400 if validation fails", async () => {
    req.body.name = "";
    req.body.email = "";
    req.body.phone = "";
    req.body.password = "";

    await registerClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Todos os campos são obrigatórios." })
    );
  });

  it("should return 409 if email already exists", async () => {
    const existingClient = {
      _id: "existingId",
      name: "João",
      email: "joao@example.com",
      phone: "123456789",
      password: "hashedPassword",
    };
    (Client.findOne as jest.Mock).mockResolvedValue(existingClient);

    req.body = {
      name: "Maria",
      email: "joao@example.com",
      phone: "987654321",
      password: "password456",
    };

    await registerClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email já cadastrado." })
    );
  });
});

describe("loginClient Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      body: {
        email: "joao@example.com",
        password: "senha123",
      },
    };
    res = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it("should return 400 if email or password is missing", async () => {
    req.body.email = "";
    req.body.password = "";

    await loginClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email e senha são obrigatórios." })
    );
  });

  it("should return 401 if credentials are invalid", async () => {
    (Client.findOne as jest.Mock).mockResolvedValue(null);

    await loginClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Credenciais inválidas." })
    );
  });

  it("should return 500 if there is an error during login", async () => {
    (Client.findOne as jest.Mock).mockRejectedValue(
      new Error("Erro inesperado")
    );

    await loginClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro ao fazer login." })
    );
  });

  it("should log in the client and return a token", async () => {
    const mockClient = {
      _id: "clientId",
      email: "joao@example.com",
      password: await bcrypt.hash("senha123", 10),
    };
    (Client.findOne as jest.Mock).mockResolvedValue(mockClient);
    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async (password, hashedPassword) => {
        return (
          password === "senha123" && hashedPassword === mockClient.password
        );
      });

    await loginClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String) })
    );
  });
});

describe("chatWithClient Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      body: {
        question: "Qual é a capital da França?",
      },
      userId: "userIdMock",
    };
    res = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it("should return 400 if question is missing", async () => {
    req.body.question = undefined;

    await chatWithClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Pergunta é obrigatória." })
    );
  });

  it("should return 404 if client not found", async () => {
    (Client.findById as jest.Mock).mockResolvedValue(null);

    await chatWithClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Cliente não encontrado." })
    );
  });

  it("should return 500 if there is an error in processing", async () => {
    (Client.findById as jest.Mock).mockRejectedValue(
      new Error("Erro inesperado")
    );

    await chatWithClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro ao processar a requisição." })
    );
  });

  it("should process chat and return the answer", async () => {
    const mockClient = {
      _id: "userIdMock",
      chatHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    (Client.findById as jest.Mock).mockResolvedValue(mockClient);
    (askChatGPT as jest.Mock).mockResolvedValue("qualquer resposta");

    await chatWithClient(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      question: req.body.question,
      answer: expect.any(String),
    });

    expect(mockClient.chatHistory).toHaveLength(1);
    expect(mockClient.chatHistory[0]).toEqual({
      question: req.body.question,
      answer: expect.any(String),
      timestamp: expect.any(Date),
    });
  });
});
