import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://frontend-video-call-app-uc65.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
});

let waitingUsers = [];

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-random", () => {
    if (
      waitingUsers.length > 0 &&
      !waitingUsers.find((user) => user.id === socket.id)
    ) {
      const partnerUser = waitingUsers.shift(); // { id: '...' }

      const partnerSocket = io.sockets.sockets.get(partnerUser.id);
      if (partnerSocket) {
        const roomID = `${partnerUser.id}#${socket.id}`;

        socket.join(roomID);
        partnerSocket.join(roomID);

        setTimeout(() => {
          io.to(roomID).emit("room-joined", roomID);
          io.to(roomID).emit("ready");
        }, 50);
      }
    } else {
      waitingUsers.push({ id: socket.id });
    }
  });

  socket.on("signal", ({ roomID, data }) => {
    socket.to(roomID).emit("signal", data);
  });

  socket.on("retry-call", ({ roomID, data }) => {
    console.log("retry-call triggered");
    socket.to(roomID).emit("retry-call", data);
  });

  socket.on("leave-room", (roomID) => {
    console.log("Leaving room:", roomID);

    socket.to(roomID).emit("user-disconnected");

    // Clean up
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

    socket.leave(roomID); // just leave the room, don’t force disconnect!
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);
  });
});

export { io, app, server };
