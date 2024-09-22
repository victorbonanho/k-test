import mongoose, { Schema, Document } from "mongoose";

interface IChatHistory {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  chatHistory: IChatHistory[];
}

const clientSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    chatHistory: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Client = mongoose.model<IClient>("Client", clientSchema);

export default Client;
