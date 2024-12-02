import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import deviceRoute from "./routes/device.js";
import locationRoute from "./routes/location.js";
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
app.use("/api/location", locationRoute);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal server error",
  });
});
server.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
