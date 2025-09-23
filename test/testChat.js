import { io } from "socket.io-client";

// ใส่ URL ของ server + token ของ user
const socket = io("http://localhost:4000", {
  auth: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWNmMTlmY2I3ZjRmNzE5ZjY0ZmNhNSIsImVtYWlsIjoidGFuYWNoYWlAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTYzMzA4OTgsImV4cCI6MTc1NjQxNzI5OH0.PKE3nlpLVxNQeVh9VevzoQOdT4O60oyRNzlZyZs_poY" } // ใช้ token ของ user จาก login
});

// ฟังข้อความเข้ามา
socket.on("receive_message", (message) => {
  console.log("📩 New message received:", message);
});

// ฟัง ack หลังส่ง
socket.on("message_sent", (message) => {
  console.log("✅ Message sent:", message);
});

// ฟัง error
socket.on("error_message", (err) => {
  console.error("❌ Error:", err);
});

// ฟังก์ชันส่งข้อความ
const sendMessage = (conversationId, receiverId, text) => {
  socket.emit("send_message", {
    conversationId,
    receiverId,
    text
  });
};

// ตัวอย่าง: ส่งข้อความหลัง connect
socket.on("connect", () => {
  console.log("Connected to socket server. Socket ID:", socket.id);

  // ส่งข้อความทดลอง
  sendMessage("CONVERSATION_ID", "RECEIVER_USER_ID", "Hello from test script!");
});
