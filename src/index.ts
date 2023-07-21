import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PlayerState, RoomState } from "./lib/types";
import {
  createRoomHandler,
  joinRoomHander,
  leaveRoomHandler,
  updateRoomHandler,
} from "./lib/roomHandler";
import { disconnectHandler } from "./lib/disconnectHandler";
import { endGameHander, startGameHander } from "./lib/gameHandler";

const port = process.env.PORT || 8080; // Set port
const app = express();
app.use(cors); // Use CORS middleware

const server = http.createServer(app); // Create HTTP server
export const io = new Server(server, {
  // Create Socket.IO server
  cors: {
    origin: ["http://localhost:3000", "https://tally-frontend-main.vercel.app"],
    methods: ["GET", "POST"],
  },
});

export const playerRooms: PlayerState = {}; // Store player rooms

export const rooms: RoomState = {}; // Store rooms

io.on("connection", (socket) => {
  socket.join("public"); // Join public room
  const sockets = Array.from(io.sockets.sockets).map((socket) => socket[0]);
  io.to("public").emit("online users", sockets.length); // Emit online users count

  socket.on("get online users", () => {
    // Handle get online users event
    const sockets = Array.from(io.sockets.sockets).map((socket) => socket[0]);
    io.to("public").emit("online users", sockets.length); // Emit online users count
  });

  disconnectHandler(socket); // Handle disconnect event
  startGameHander(socket); // Handle start game event
  endGameHander(socket); // Handle end game event
  joinRoomHander(socket); // Handle join room event
  leaveRoomHandler(socket); // Handle leave room event
  createRoomHandler(socket); // Handle create room event
  updateRoomHandler(socket); // Handle update room event
});

server.listen(port, () => {
  // Start server
  console.log(`Listening to server on port ${port}`);
});
