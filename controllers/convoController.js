import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
  try {
    const { memberId } = req.body;
    const userId = req.user.id


    let conversation = await Conversation.findOne({
      members: {$all: [userId, memberId]}
    })

    if (!conversation) {
      conversation = await Conversation.create({ members: [userId, memberId] })
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ members: userId })
      .populate("members", "name email")
      .populate("lastMessage", "text senderId createdAt")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};