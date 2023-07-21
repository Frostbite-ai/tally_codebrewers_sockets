"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRoomHandler = exports.joinRoomHander = exports.updateRoomHandler = exports.createRoomHandler = void 0;
const __1 = require("..");
const functions_1 = require("./functions");
// Define a function to handle the creation of a room
const createRoomHandler = (socket) => {
    // Listen for the "create room" event from the client
    socket.on("create room", (roomId, mode) => {
        // If the room already exists, emit a "room already exist" event to the client
        if (__1.io.sockets.adapter.rooms.get(roomId)) {
            socket.emit("room already exist");
        }
        else {
            // Shuffle the list based on the mode and join it into a string
            const toType = (0, functions_1.shuffleList)(mode).join(" ");
            // Create the room with the initial game state
            __1.rooms[roomId] = {
                players: [],
                toType,
                inGame: false,
                winner: null,
            };
            // Emit a "words generated" event to the client with the words to type
            socket.emit("words generated", __1.rooms[roomId].toType);
            // Emit a "create room success" event to the client with the ID of the room
            socket.emit("create room success", roomId);
        }
    });
};
exports.createRoomHandler = createRoomHandler;
// Define a function to handle the updating of a room
const updateRoomHandler = (socket) => {
    // Listen for the "room update" event from the client
    socket.on("room update", (user) => {
        const { roomId } = user;
        // If the room doesn't exist, do nothing
        if (!__1.rooms[roomId])
            return;
        // Update the player in the list of players
        const players = __1.rooms[roomId].players;
        __1.rooms[roomId].players = players.map((player) => player.id !== user.id ? player : user);
        // Emit a "room update" event to the room with the updated list of players
        __1.io.in(roomId).emit("room update", __1.rooms[roomId].players);
    });
};
exports.updateRoomHandler = updateRoomHandler;
// Define a function to handle a client joining a room
const joinRoomHander = (socket) => {
    // Listen for the "join room" event from the client
    socket.on("join room", ({ roomId, user }) => {
        // Emit an "end game" event to the client
        socket.emit("end game");
        const room = __1.rooms[roomId];
        // If the room doesn't exist, emit a "room invalid" event to the client
        if (!room) {
            socket.emit("room invalid");
            return;
            // If a game is in progress in the room, emit a "room in game" event to the client
        }
        else if (__1.rooms[roomId].inGame) {
            socket.emit("room in game");
            return;
            // Otherwise, add the client to the list of players and update the player's rooms
        }
        else {
            __1.rooms[roomId].players = [...__1.rooms[roomId].players, user];
            __1.playerRooms[socket.id] = [roomId];
        }
        // Have the client join the room
        socket.join(roomId);
        // Emit a "words generated" event to the client with the words to type
        socket.emit("words generated", __1.rooms[roomId].toType);
        // Emit a "room update" event to the room with the updated list of players
        __1.io.in(roomId).emit("room update", __1.rooms[roomId].players);
    });
};
exports.joinRoomHander = joinRoomHander;
// Define a function to handle a client leaving a room
const leaveRoomHandler = (socket) => {
    // Listen for the "leave room" event from the client
    socket.on("leave room", (user) => {
        const { roomId } = user;
        const players = __1.rooms[roomId];
        // If the room doesn't exist, do nothing
        if (!players)
            return;
        // Remove the client from the list of players
        __1.rooms[roomId].players = players.players.filter((player) => {
            return player.id !== user.id;
        });
        // Emit a "room update" event to the room with the updated list of players
        __1.io.in(roomId).emit("room update", __1.rooms[roomId].players);
        // If there are no players left in the room, delete the room
        if (__1.rooms[roomId].players.length === 0) {
            delete __1.rooms[roomId];
        }
    });
};
exports.leaveRoomHandler = leaveRoomHandler;
