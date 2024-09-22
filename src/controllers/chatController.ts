import { Response, Request } from "express";
import Client from "../models/clientModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

// Função que processa a interação entre o cliente e o ChatGPT
export const chatWithClient = async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Pergunta é obrigatória." });
  }

  try {
    const client = await Client.findById(req.userId);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    // Enviar a pergunta ao ChatGPT
    const answer = (await askChatGPT(question)) || "Resposta não disponível.";

    // Adicionar nova pergunta e resposta ao histórico
    client.chatHistory.push({
      question,
      answer,
      timestamp: new Date(), // Adicione o timestamp atual
    });
    await client.save();

    res.status(200).json({ question, answer });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Erro ao processar a requisição.";
    res.status(500).json({
      message: "Erro ao processar a requisição.",
      error: errorMessage,
    });
  }
};

//INTERNAL FUNCTIONS
// Função para interagir com o ChatGPT
export async function askChatGPT(question: string) {
  const openai = new OpenAI();

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }],
    stream: false,
  });

  return stream.choices[0]?.message.content;
}
