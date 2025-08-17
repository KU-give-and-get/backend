import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/mongodb.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import connectCloudinary from './config/cloudinary.js'

// create app
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.get('/',(req, res) => {
  res.send("API Working")
})

const startServer = async () => {
  try {
    connectDB()
    app.listen(port,()=> console.log('Server is running on PORT :' + port))
  } catch (error) {
    console.error('Failed to connect DB', error)
    process.exit(1)
  }
}

startServer()
