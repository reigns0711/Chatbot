import axios from "axios";

const API_URL = "http://localhost:5000/api";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const sendMessage = async (messages: Message[]) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { messages });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
