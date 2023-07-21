"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectHandler = void 0;
const __1 = require("..");
// Define a function to handle a client disconnecting
const disconnectHandler = (socket) => {
    // Listen for the "disconnect" event from the client
    socket.on("disconnect", () => {
        // Get the number of connected clients and emit it to the "public" room
        const sockets = Array.from(__1.io.sockets.sockets).map((socket) => socket[0]);
        __1.io.to("public").emit("online users", sockets.length);
        // Get the rooms the disconnected client was in
        const disconnectPlayerFrom = __1.playerRooms[socket.id];
        // If the client wasn't in any rooms, do nothing
        if (!disconnectPlayerFrom)
            return;
        // For each room the client was in
        disconnectPlayerFrom.forEach((roomId) => {
            // If the room doesn't exist, do nothing
            if (!__1.rooms[roomId])
                return;
            // Get the players in the room
            const players = __1.rooms[roomId].players;
            // Remove the disconnected client from the list of players
            __1.rooms[roomId].players = players.filter((player) => {
                // If the player is the disconnected client
                if (player.id === socket.id) {
                    // Emit a "receive chat" event to the room with a message saying the client left
                }
                // Keep the player in the list if they're not the disconnected client
                return player.id !== socket.id;
            });
            // Emit a "room update" event to the room with the updated list of players
            __1.io.in(roomId).emit("room update", __1.rooms[roomId].players);
            // If there are no players left in the room, delete the room
            if (__1.rooms[roomId].players.length === 0) {
                delete __1.rooms[roomId];
            }
        });
        // Remove the disconnected client from the list of players
        delete __1.playerRooms[socket.id];
    });
};
exports.disconnectHandler = disconnectHandler;
