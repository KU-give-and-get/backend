import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AuthUser from '../models/AuthUser.js'
import { OAuth2Client } from 'google-auth-library'
import axios from 'axios'
import validator from 'validator'
import nodemailer from 'nodemailer';


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
  const { name, email, password } = req.body

  try {
    
    // ตรวจสอบว่าเป็น email format ปกติ
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    // ตรวจสอบว่าเป็น domain ของเกษตร
    if (!email.endsWith("@ku.th") && !email.endsWith("@live.ku.th")) {
        return res.status(400).json({ message: "Email must be a Kasetsart university email" });
    }

    // check user is already esixt
    const existingUser = await AuthUser.findOne({ email })
    if (existingUser) {
      return res.status(400).json({message: 'This Email is already exist'})
    }

    // encrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // create new user
    const newUser = new AuthUser({
      name,
      email,
      password: hashedPassword,
      provider: 'local',
      isVerified: false
    })

    await newUser.save()
    await sendVerificationEmail(email, verificationToken);
    // create JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email},
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({token, user:{ id: newUser._id, name: newUser.name, email: newUser.email , isVerified: newUser.isVerified }})

  } catch (error) {
    res.status(500).json({ message: 'Server error:' + error})
  }

}

export const login  = async (req, res) => {
  const  { email, password } = req.body
  try {
    const user = await AuthUser.findOne({email})
    if (!user) return res.status(400).json({ message: 'User not found' })

    const hashedPassword = user.password;
    
    const isMatch  = await bcrypt.compare(password, hashedPassword)
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })
    const token = jwt.sign(
      { id: user._id, email: user.email},
      process.env.JWT_SECRET,
      {expiresIn: '1d'}
    )

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' + error})
  } 
}

export const handleGooglePostLogin = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: 'accessToken is required' });

  try {
    // ดึงข้อมูล user จาก Google ด้วย accessToken
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const payload = response.data;
    if (!payload.email.endsWith("@ku.th") && !payload.email.endsWith("@live.ku.th")) {
        return res.status(400).json({ message: "Email must be a Kasetsart university email" });
    }
    // หา user ใน DB
    let user = await AuthUser.findOne({ email: payload.email });
    if (!user) {
      user = new AuthUser({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        provider: 'google',
        isVerified: true
      });
      await user.save();
    }
    if(user.isVerified === false){
      user.isVerified = true;
      await user.save();
    }

    // สร้าง JWT ของระบบเรา
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid access token' });
  }
};
