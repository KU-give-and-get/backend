import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AuthUser from '../models/AuthUser.js'
import { OAuth2Client } from 'google-auth-library'
import axios from 'axios'
import validator from 'validator'

export const signup = async (req, res) => {
  const { name, email, password } = req.body

  try {
    
    // ตรวจสอบว่าเป็น email format ปกติ
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    // ตรวจสอบว่าเป็น domain ของเกษตร
    if (!email.endsWith("@ku.th") && !email.endsWith("@live.ku.th")) {
        return res.status(400).json({ error: "Email must be a Kasetsart university email" });
    }

    // check user is already esixt
    const existingUser = await AuthUser.findOne({ email })
    if (existingUser) {
      return res.status(400).json({message: 'This Email is already exist'})
    }

    // encrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create new user
    const newUser = new AuthUser({
      name,
      email,
      password: hashedPassword,
      provider: 'local'
    })

    await newUser.save()

    // create JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email},
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({token, user:{ id: newUser._id, name: newUser.name, email: newUser.email }})

  } catch (error) {
    res.status(500).json({ message: 'Server error' + error})
  }

}

export const login  = async (req, res) => {
  const  { email, password } = req.body
  try {
    const user = await AuthUser.findOne({email})
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    const hashedPassword = user.password;
    
    const isMatch  = await bcrypt.compare(password, hashedPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email},
      process.env.JWT_SECRET,
      {expiresIn: '1d'}
    )

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
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

    // หา user ใน DB
    let user = await AuthUser.findOne({ email: payload.email });
    if (!user) {
      user = new AuthUser({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        provider: 'google',
      });
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

export const getUser = async (req, res) => {
  try {
    // ดึง token จาก header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // ตรวจสอบและ decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // decoded จะมี id และ email (ตามที่เรา sign ไว้)
    const userId = decoded.id;

    // หา user จาก DB
    const user = await AuthUser.findById(userId).select("-password -__v"); 
    // select เอาเฉพาะ field ที่ต้องการ แยก password ออก

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};