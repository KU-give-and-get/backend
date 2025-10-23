import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AuthUser from '../models/AuthUser.js'
import { OAuth2Client } from 'google-auth-library'
import axios from 'axios'
import validator from 'validator'
import nodemailer from 'nodemailer';
import cloudinary from "../config/cloudinary.js";


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (userEmail, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Verify your email",
    html: `<p>Click the link below to verify your email:</p>
           <a href="${url}">${url}</a>`
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthUser.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' + error });
  }
};



export const signup = async (req, res) => {
  const { name, email, password, faculty, major, isLoan, profileImageUrl } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!email.endsWith("@ku.th") && !email.endsWith("@live.ku.th")) {
      return res.status(400).json({ message: "Email must be a Kasetsart university email" });
    }

    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const newUser = new AuthUser({
      name,
      email,
      password: hashedPassword,
      provider: 'local',
      isVerified: false,
      faculty: faculty || "",
      major: major || "",
      isLoan: isLoan || false,
      profileImageUrl: profileImageUrl || ""
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        isVerified: newUser.isVerified,
        faculty: newUser.faculty,
        major: newUser.major,
        isLoan: newUser.isLoan,
        profileImageUrl: newUser.profileImageUrl
      } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    if (!user.isVerified) {
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
      await sendVerificationEmail(email, verificationToken);
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        faculty: user.faculty,
        major: user.major,
        isLoan: user.isLoan,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error });
  }
};

export const handleGooglePostLogin = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: 'accessToken is required' });

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const payload = response.data;
    if (!payload.email.endsWith("@ku.th") && !payload.email.endsWith("@live.ku.th")) {
      return res.status(400).json({ message: "Email must be a Kasetsart university email" });
    }

    let user = await AuthUser.findOne({ email: payload.email });
    if (!user) {
      user = new AuthUser({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        provider: 'google',
        isVerified: true,
        faculty: "",
        major: "",
        isLoan: false,
        profileImageUrl: payload.picture || ""
      });
      await user.save();
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        faculty: user.faculty,
        major: user.major,
        isLoan: user.isLoan,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid access token' });
  }
};

export const getUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await AuthUser.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { name, faculty, major, isLoan } = req.body;

    if (!name || !faculty || !major) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let profileImageUrl;

    // อัปโหลดรูปใหม่ถ้ามี
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "profile",
      });

      profileImageUrl = uploadRes.secure_url;
    }

    // อัปเดตข้อมูล user
    const updatedUser = await AuthUser.findByIdAndUpdate(
      req.user.id, 
      {
        name,
        faculty,
        major,
        isLoan,
        ...(profileImageUrl && { profileImageUrl }), 
      },
      { new: true }
    ).select("-password -__v");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
  
};
export const resetPassword = async (req, res) => {
      const { token, password } = req.body;
      
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await AuthUser.findOne({ email: decoded.email });
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          if (await bcrypt.compare(password, user.password)) {
              return res.status(400).json({ message: 'New password must be different from the old password' });
          }
          user.password = hashedPassword;
          await user.save();
          res.status(200).json({ message: 'Password reset successfully' });
      } catch (error) {
          res.status(500).json({ message: 'Server error : ' + error });
      }
};
export const sendResetPasswordLink = async (req, res) => {
      const { email } = req.body;
      try {
          const user = await AuthUser.findOne({ email });
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
          const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '5m' });
          const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
          let info = await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Reset your password",
              html: `<p>Click the link below to reset your password:</p>
                     <a href="${url}">${url}</a>`
          });
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.status(200).json({ message: 'Password reset link sent to your email' });
      } catch (error) {
          res.status(500).json({ message: 'Server error : ' + error });
      }

};