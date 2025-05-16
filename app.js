import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import { dbConnect } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
import { app, server } from "./lib/socket.js";
dbConnect();
app.use(cors({ origin: " https://cam-roll.netlify.app/", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", userRouter);
server.listen(3000, () => {
  console.log("server running on port 3000");
});
