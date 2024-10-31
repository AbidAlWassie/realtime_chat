// server/index.ts

import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    const messageData = {
      ...data,
      senderId: socket.id,
    };
    io.to(data.room).emit("receive_message", messageData);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING on port 3001");
});
