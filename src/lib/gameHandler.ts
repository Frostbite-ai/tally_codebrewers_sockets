import { Socket } from "socket.io";
import { io, rooms } from "..";
import { shuffleList } from "./functions";

// Define a function to handle the end of a game
export const endGameHander = (socket: Socket) => {
  // Listen for the "end game" event from the client
  socket.on(
    "end game",
    (roomId: string, mode: "words" | "sentences" | "numbers") => {
      // Shuffle the list based on the mode and join it into a string
      const toType = shuffleList(mode).join(" ");
      // Update the room with the new game state
      rooms[roomId] = {
        players: rooms[roomId].players,
        toType,
        inGame: false, // Game has ended
        winner: socket.id, // The client who ended the game is the winner
      };
      // Emit an "end game" event to the room with the ID of the winner
      io.in(roomId).emit("end game", socket.id);
    }
  );
};

// Define a function to handle the start of a game
export const startGameHander = (socket: Socket) => {
  // Listen for the "start game" event from the client
  socket.on("start game", (roomId: string) => {
    // Emit a "words generated" event to the room with the words to type
    io.in(roomId).emit("words generated", rooms[roomId].toType);
    // Emit a "start game" event to the room
    io.in(roomId).emit("start game");
    // Update the room to indicate that a game is in progress
    rooms[roomId].inGame = true;
  });
};
