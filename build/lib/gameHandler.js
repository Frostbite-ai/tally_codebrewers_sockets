"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameHander = exports.endGameHander = void 0;
const __1 = require("..");
const functions_1 = require("./functions");
// Define a function to handle the end of a game
const endGameHander = (socket) => {
    // Listen for the "end game" event from the client
    socket.on("end game", (roomId, mode) => {
        // Shuffle the list based on the mode and join it into a string
        const toType = (0, functions_1.shuffleList)(mode).join(" ");
        // Update the room with the new game state
        __1.rooms[roomId] = {
            players: __1.rooms[roomId].players,
            toType,
            inGame: false,
            winner: socket.id, // The client who ended the game is the winner
        };
        // Emit an "end game" event to the room with the ID of the winner
        __1.io.in(roomId).emit("end game", socket.id);
    });
};
exports.endGameHander = endGameHander;
// Define a function to handle the start of a game
const startGameHander = (socket) => {
    // Listen for the "start game" event from the client
    socket.on("start game", (roomId) => {
        // Emit a "words generated" event to the room with the words to type
        __1.io.in(roomId).emit("words generated", __1.rooms[roomId].toType);
        // Emit a "start game" event to the room
        __1.io.in(roomId).emit("start game");
        // Update the room to indicate that a game is in progress
        __1.rooms[roomId].inGame = true;
    });
};
exports.startGameHander = startGameHander;
