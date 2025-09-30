import WishItem from "../models/WishItem.js";
import { v2 as cloudinary } from "cloudinary";

export const createWishItem = async (req, res) => {
  try {
    const { name, description, category, status, location, contact, quantity } = req.body;

    if (!name || !description || !category || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let imageUrl = null;

    // ✅ handle single image upload
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "wishItems", // แยกโฟลเดอร์กับ product
      });

      imageUrl = uploadRes.secure_url;
    }

    const wishItem = new WishItem({
      name,
      description,
      category,
      status: status || "pending",
      location,
      contact,
      quantity,
      recipientId: req.user.id, // ผู้รับคือ user ที่ล็อกอิน
      imageUrl, // ✅ เก็บ url เดียว
      createdAt: new Date(),
    });

    await wishItem.save();

    res.status(201).json(wishItem);
  } catch (error) {
    console.error("Create wish item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All WishItems
export const getWishItems = async (req, res) => {
  try {
    const wishItems = await WishItem.find();
    res.json(wishItems);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get WishItem By Id
export const getWishItemById = async (req, res) => {
  try {
    const wishItem = await WishItem.findById(req.params.id);
    if (!wishItem) {
      return res.status(404).json({ message: "WishItem not found" });
    }
    res.json(wishItem);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get WishItems by recipientId (เจ้าของ wish)
export const getWishItemsByRecipientId = async (req, res) => {
  try {
    const recipientId = req.user.id;
    const wishItems = await WishItem.find({ recipientId });
    res.json(wishItems);
  } catch (error) {
    console.error("Get wish items by recipientId error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete WishItem
export const deleteWishItem = async (req, res) => {
  try {
    const wishItem = await WishItem.findById(req.params.id);
    if (!wishItem) {
      return res.status(404).json({ message: "WishItem not found" });
    }
    await wishItem.deleteOne();
    res.json({ message: "WishItem removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update WishItem (รวมอัพโหลดรูปใหม่)
export const updateWishItem = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // ถ้ามีการอัพโหลดไฟล์ใหม่ → อัพไป Cloudinary
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "wishItems",
      });

      updateData.imageUrl = uploadRes.secure_url;
    }

    const updatedWishItem = await WishItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedWishItem) {
      return res.status(404).json({ message: "WishItem not found" });
    }
    res.json(updatedWishItem);
  } catch (error) {
    console.error("Update wish item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update WishItem Status
export const updateWishItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const wishItem = await WishItem.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    );

    if (!wishItem)
      return res.status(404).json({ message: "WishItem not found" });

    res.json(wishItem);
  } catch (error) {
    console.error("Update wish item status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
