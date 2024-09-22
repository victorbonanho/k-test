import { Response, Request } from "express";
import Client from "../models/clientModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerClient = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  // Validação dos campos obrigatórios
  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(409).json({ message: "Email já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = new Client({ name, email, phone, password: hashedPassword });

    await client.save();
    res.status(201).json({ message: "Cliente registrado com sucesso." });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Erro ao registrar cliente.";
    res
      .status(400)
      .json({ message: "Erro ao registrar cliente.", error: errorMessage });
  }
};

export const loginClient = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const client = await Client.findOne({ email });

    if (!client || !(await bcrypt.compare(password, client.password))) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(401).json({ message: "Chave JWT não encontrada" });
    }

    const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    const errorMessage = (error as Error).message || "Erro ao fazer login.";
    res
      .status(500)
      .json({ message: "Erro ao fazer login.", error: errorMessage });
  }
};
