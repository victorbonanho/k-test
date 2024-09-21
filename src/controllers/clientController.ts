import { Request, Response } from "express";
import Client from "../models/clientModel";

export const createClient = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  const client = new Client({ name, email, phone });
  await client.save();
  res.status(201).send(client);
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find();
    res.status(200).send(clients);
  } catch (err) {
    res.status(500).send("Erro ao buscar clientes");
  }
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).send("Cliente não encontrado");
    }
    res.status(200).send(client);
  } catch (err) {
    res.status(500).send("Erro ao buscar cliente");
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  try {
    const client = await Client.findByIdAndUpdate(id, { name, email, phone }, { new: true });
    if (!client) {
      return res.status(404).send("Cliente não encontrado");
    }
    res.status(200).send(client);
  } catch (err) {
    res.status(500).send("Erro ao atualizar cliente");
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).send("Cliente não encontrado");
    }
    res.status(200).send("Cliente deletado com sucesso");
  } catch (err) {
    res.status(500).send("Erro ao deletar cliente");
  }
};
