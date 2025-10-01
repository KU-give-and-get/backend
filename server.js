import express from 'express'
import 'dotenv/config'
import http from "http"
import cors from 'cors'
import connectDB from './config/mongodb.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import convoRoutes from './routes/convoRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import wishItemRoutes from './routes/wishItemRoutes.js'
import { initSocket } from './config/socket.js'
import reservationRoutes from './routes/reservationRoutes.js'

// create app
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/conversations', convoRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/wishitems', wishItemRoutes)
app.use("/api/reservations", reservationRoutes);

app.get('/',(req, res) => {
  res.send("API Working")
})

const server = http.createServer(app)
initSocket(server)

const startServer = async () => {
  try {
    connectDB()
    server.listen(port,()=> console.log('Server is running on PORT :' + port))
  } catch (error) {
    console.error('Failed to connect DB', error)
    process.exit(1)
  }
}

startServer()
