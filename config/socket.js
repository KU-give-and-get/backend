import { Server as IoServer } from "socket.io";
import { socketAuth } from "../middleware/socketAuth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { handleSocketMessage } from "../controllers/messageController.js";

const onlineMap = new Map()

export const initSocket = (server) => {
  const io = new IoServer(server, {
    cors: {
      origin: "*"
    }
  })

  io.use(socketAuth)
  
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    
    const set = onlineMap.get(userId) || new Set()
    set.add(socket.id);
    onlineMap.set(userId, set)

    console.log(`User connected: ${userId}`)

    socket.on("send_message", (payload) => handleSocketMessage(io, socket, payload, onlineMap))

    socket.on("disconnect", () => {
      const set = onlineMap.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineMap.delete(userId);
      }
      console.log(`User disconnected: ${userId}`);
    });
  })
  return io
}