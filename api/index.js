import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import deviceRoute from "./routes/device.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: "*" } });

mongoose
  .connect(process.env.URL_DB)
  .then(() => {
    console.log("Connect database successfully");
  })
  .catch((err) => {
    console.log(err);
  });

io.on("connection", (socket) => {
  console.log("Socket is running");
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

app.use(cors());
app.use(express.json());
app.use("/api/device", deviceRoute);
server.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
