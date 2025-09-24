import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const handleSocketMessage = async (io, socket, payload, onlineMap) => {
  try {
    const senderId = socket.data.userId;
    
    if (!payload.conversationId || !payload.receiverId || (!payload.text && !payload.attachments?.length)) {
          return socket.emit("error_message", { message: "Invalid payload" });
        }

        const conversation = await Conversation.findById(payload.conversationId)
        if (!conversation.members.map(m => m.toString()).includes(senderId)) {
          return socket.emit("error_message", { message: "Not authorized in this conversation" });
        }

        const message = await Message.create({
          conversationId: payload.conversationId,
          senderId,
          text: payload.text,
          attachments: payload.attachments || [],
          seenBy: [senderId]
        })

        const receiverSockets = onlineMap.get(payload.receiverId) || [];
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit("receive_message", message);
        })

        socket.emit("message_sent", message);
  } catch (err) {
    console.error(err);
    socket.emit("error_message", { message: "Send failed" });
  }
};

export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { conversationId, text, attachments } = req.body;
    const senderId = req.user.id;

    if (!conversationId || (!text && !attachments?.length)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
      attachments: attachments || [],
      seenBy: [senderId],
    });


    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

