import { Socket } from "socket.io";
import { io, playerRooms, rooms } from "..";

// Define a function to handle a client disconnecting
export const disconnectHandler = (socket: Socket) => {
  // Listen for the "disconnect" event from the client
  socket.on("disconnect", () => {
    // Get the number of connected clients and emit it to the "public" room
    const sockets = Array.from(io.sockets.sockets).map((socket) => socket[0]);
    io.to("public").emit("online users", sockets.length);

    // Get the rooms the disconnected client was in
    const disconnectPlayerFrom = playerRooms[socket.id];
    // If the client wasn't in any rooms, do nothing
    if (!disconnectPlayerFrom) return;
    // For each room the client was in
    disconnectPlayerFrom.forEach((roomId) => {
      // If the room doesn't exist, do nothing
      if (!rooms[roomId]) return;
      // Get the players in the room
      const players = rooms[roomId].players;
      // Remove the disconnected client from the list of players
      rooms[roomId].players = players.filter((player) => {
        // If the player is the disconnected client
        if (player.id === socket.id) {
          // Emit a "receive chat" event to the room with a message saying the client left
        }
        // Keep the player in the list if they're not the disconnected client
        return player.id !== socket.id;
      });

      // Emit a "room update" event to the room with the updated list of players
      io.in(roomId).emit("room update", rooms[roomId].players);
      // If there are no players left in the room, delete the room
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    });

    // Remove the disconnected client from the list of players
    delete playerRooms[socket.id];
  });
};
