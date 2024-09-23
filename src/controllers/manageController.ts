import { Response, Request } from "express";
import Client from "../models/clientModel";

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    const errorMessage = (error as Error).message || "Erro ao buscar clientes.";
    res
      .status(500)
      .json({ message: "Erro ao buscar clientes.", error: errorMessage });
  }
};

export const deleteClientById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    res.status(200).json({ message: "Cliente deletado com sucesso." });
  } catch (error) {
    const errorMessage = (error as Error).message || "Erro ao deletar cliente.";
    res
      .status(500)
      .json({ message: "Erro ao deletar cliente.", error: errorMessage });
  }
};
