import { Server } from "socket.io";
import http from "http";
import { randomUUID } from "crypto";
import express from "express";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});
let waitingUsers = [];
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join-random", (data) => {
    if (
      waitingUsers.length > 0 &&
      !waitingUsers.some((user) => user.id === socket.id)
    ) {
      const partner = waitingUsers.shift();
      const roomID = `${partner.id}#${socket.id}`;
      socket.join(roomID);
      partner.join(roomID);
      setTimeout(() => {
        io.to(roomID).emit("room-joined", roomID);
        io.to(roomID).emit("ready");
      }, 50);
    } else {
      waitingUsers.push(socket);
    }
  });
  socket.on("signal", ({ roomID, data }) => {
    socket.to(roomID).emit("signal", data);
  });
  socket.on("retry-call", ({ roomID, data }) => {
    console.log("came hey");
    socket.to(roomID).emit("retry-call", data);
  });
  socket.on("leave-room", (roomId) => {
    console.log(roomId);
    console.log("came hey");

    // Notify others
    socket.to(roomId).emit("user-disconnected");

    // Cleanup waitingUsers here on leave-room event
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

    socket.disconnect(true);
  });

  socket.on("disconnect", () => {
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);
  });
});
export { io, app, server };
