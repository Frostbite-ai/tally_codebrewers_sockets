"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = exports.playerRooms = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const roomHandler_1 = require("./lib/roomHandler");
const disconnectHandler_1 = require("./lib/disconnectHandler");
const gameHandler_1 = require("./lib/gameHandler");
const port = process.env.PORT || 8080; // Set port
const app = (0, express_1.default)();
app.use(cors_1.default); // Use CORS middleware
const server = http_1.default.createServer(app); // Create HTTP server
exports.io = new socket_io_1.Server(server, {
    // Create Socket.IO server
    cors: {
        origin: ["http://localhost:3000", "https://tally-frontend-main.vercel.app"],
        methods: ["GET", "POST"],
    },
});
exports.playerRooms = {}; // Store player rooms
exports.rooms = {}; // Store rooms
exports.io.on("connection", (socket) => {
    socket.join("public"); // Join public room
    const sockets = Array.from(exports.io.sockets.sockets).map((socket) => socket[0]);
    exports.io.to("public").emit("online users", sockets.length); // Emit online users count
    socket.on("get online users", () => {
        // Handle get online users event
        const sockets = Array.from(exports.io.sockets.sockets).map((socket) => socket[0]);
        exports.io.to("public").emit("online users", sockets.length); // Emit online users count
    });
    (0, disconnectHandler_1.disconnectHandler)(socket); // Handle disconnect event
    (0, gameHandler_1.startGameHander)(socket); // Handle start game event
    (0, gameHandler_1.endGameHander)(socket); // Handle end game event
    (0, roomHandler_1.joinRoomHander)(socket); // Handle join room event
    (0, roomHandler_1.leaveRoomHandler)(socket); // Handle leave room event
    (0, roomHandler_1.createRoomHandler)(socket); // Handle create room event
    (0, roomHandler_1.updateRoomHandler)(socket); // Handle update room event
});
server.listen(port, () => {
    // Start server
    console.log(`Listening to server on port ${port}`);
});
