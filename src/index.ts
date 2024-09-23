import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiRoutesV1 from "./routes/apiRoutesV1";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

dotenv.config();

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("A variável de ambiente MONGODB_URI não está definida");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB", err));

// Serve a documentação Swagger na rota /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota principal (/) para verificar se a API está no ar
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "🚀 API k-test rodando com sucesso! Verifique o README.md para instruções de como utilizar. Link no Github: https://github.com/victorbonanho/k-test",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// Usar as rotas
app.use("/api/v1", apiRoutesV1);

// Iniciar o servidor
const server = app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});

export { app, server };
