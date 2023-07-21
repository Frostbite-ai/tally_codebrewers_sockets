import { Socket } from "socket.io";
import { io, playerRooms, rooms } from "..";
import { shuffleList } from "./functions";
import { Player } from "./types";

// Define a function to handle the creation of a room
export const createRoomHandler = (socket: Socket) => {
  // Listen for the "create room" event from the client
  socket.on(
    "create room",
    (roomId: string, mode: "words" | "sentences" | "numbers") => {
      // If the room already exists, emit a "room already exist" event to the client
      if (io.sockets.adapter.rooms.get(roomId)) {
        socket.emit("room already exist");
      } else {
        // Shuffle the list based on the mode and join it into a string
        const toType = shuffleList(mode).join(" ");
        // Create the room with the initial game state
        rooms[roomId] = {
          players: [],
          toType,
          inGame: false,
          winner: null,
        };
        // Emit a "words generated" event to the client with the words to type
        socket.emit("words generated", rooms[roomId].toType);
        // Emit a "create room success" event to the client with the ID of the room
        socket.emit("create room success", roomId);
      }
    }
  );
};

// Define a function to handle the updating of a room
export const updateRoomHandler = (socket: Socket) => {
  // Listen for the "room update" event from the client
  socket.on("room update", (user: Player) => {
    const { roomId } = user;
    // If the room doesn't exist, do nothing
    if (!rooms[roomId]) return;
    // Update the player in the list of players
    const players = rooms[roomId].players;
    rooms[roomId].players = players.map((player) =>
      player.id !== user.id ? player : user
    );
    // Emit a "room update" event to the room with the updated list of players
    io.in(roomId).emit("room update", rooms[roomId].players);
  });
};

// Define a function to handle a client joining a room
export const joinRoomHander = (socket: Socket) => {
  // Listen for the "join room" event from the client
  socket.on(
    "join room",
    ({ roomId, user }: { roomId: string; user: Player }) => {
      // Emit an "end game" event to the client
      socket.emit("end game");
      const room = rooms[roomId];
      // If the room doesn't exist, emit a "room invalid" event to the client
      if (!room) {
        socket.emit("room invalid");
        return;
        // If a game is in progress in the room, emit a "room in game" event to the client
      } else if (rooms[roomId].inGame) {
        socket.emit("room in game");
        return;
        // Otherwise, add the client to the list of players and update the player's rooms
      } else {
        rooms[roomId].players = [...rooms[roomId].players, user];
        playerRooms[socket.id] = [roomId];
      }

      // Have the client join the room
      socket.join(roomId);
      // Emit a "words generated" event to the client with the words to type
      socket.emit("words generated", rooms[roomId].toType);
      // Emit a "room update" event to the room with the updated list of players
      io.in(roomId).emit("room update", rooms[roomId].players);
    }
  );
};

// Define a function to handle a client leaving a room
export const leaveRoomHandler = (socket: Socket) => {
  // Listen for the "leave room" event from the client
  socket.on("leave room", (user: Player) => {
    const { roomId } = user;
    const players = rooms[roomId];
    // If the room doesn't exist, do nothing
    if (!players) return;
    // Remove the client from the list of players
    rooms[roomId].players = players.players.filter((player) => {
      return player.id !== user.id;
    });

    // Emit a "room update" event to the room with the updated list of players
    io.in(roomId).emit("room update", rooms[roomId].players);
    // If there are no players left in the room, delete the room
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
    }
  });
};
