const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const http = require('http'); // Add this import
const { Server } = require('socket.io');
const nodemailer = require("nodemailer");
const predictRoutes = require('../dendrite-backend/routes/predict');
const mongoose = require('mongoose');


const app = express();
const PORT = 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Setup Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rest of your Socket.IO code remains the same
io.on("connection", (socket) => {
  console.log("🧑‍🎨 User connected:", socket.id);
  
  socket.on("draw-line", (lineData) => {
    socket.broadcast.emit("draw-line", lineData);
  });
  
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
  socket.on("send-message", (messageData) => {
    socket.broadcast.emit("receive-message", messageData);
  });
  
});



// CORS setup for frontend
app.use(cors());

// Multer for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Hugging Face API config
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HF_API_KEY = process.env.HF_API_KEY;

// Predict endpoint
app.use('/predict', predictRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//inviting and group collaboration

app.post("/send-invite", async (req, res) => {
  const { to, sessionUrl } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail", // or use Mailtrap for testing
    auth: {
      user: "your_email@gmail.com",
      pass: "your_app_password",
    },
  });

  const mailOptions = {
    from: '"Whiteboard App" <your_email@gmail.com>',
    to,
    subject: "You're invited to collaborate on a whiteboard!",
    text: `Join the whiteboard session here: ${sessionUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Invite sent!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send invite" });
  }
});

//database connection
mongoose.connect('mongodb://localhost:27017/image-classifier', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Change this to use the HTTP server instead of the Express app directly
server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});