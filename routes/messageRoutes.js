import { Router } from "express";
import { sendMessage, markMessagesAsRead, getMessages } from "../controllers/messageController.js";

const messageRoute = Router();

messageRoute.post('/', sendMessage);
messageRoute.get('/', getMessages);
messageRoute.patch('/read', markMessagesAsRead);

export default messageRoute;
