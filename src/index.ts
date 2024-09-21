import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes";

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

// Usar as rotas
app.use(clientRoutes);

// Iniciar o servidor
app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
