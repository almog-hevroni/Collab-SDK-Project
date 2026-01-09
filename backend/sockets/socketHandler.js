const Room = require("../models/Room");

// In-memory storage for room participants to assign indexes 0 and 1
// Structure: { roomId: [socketId_for_0, socketId_for_1] }
// We use an array where index 0 is participant 0, index 1 is participant 1.
// value is null if empty.
const roomParticipants = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    // --- Joining a room + retrieving information---
    socket.on("join_room", async (roomId) => {
      // Initialize room tracking if not exists
      if (!roomParticipants[roomId]) {
        roomParticipants[roomId] = [null, null];
      }

      const participants = roomParticipants[roomId];
      let assignedIndex = -1;

      // Check for empty slots
      if (participants[0] === null) {
        assignedIndex = 0;
      } else if (participants[1] === null) {
        assignedIndex = 1;
      }

      if (assignedIndex === -1) {
        // Room is full
        socket.emit("collab_event", {
          type: "ERROR",
          message: "Room is full (Max 2 participants)",
        });
        return;
      }

      // Assign the spot
      participants[assignedIndex] = socket.id;

      socket.join(roomId);
      console.log(
        `User ${socket.id} joined room: ${roomId} as Participant ${assignedIndex}`
      );

      // Send Session Info to the user so they know who they are
      socket.emit("collab_event", {
        type: "SESSION_INFO",
        participantIndex: assignedIndex,
      });

      try {
        // Fetch existing state from Database
        const room = await Room.findOne({ roomId });

        if (room && room.roomState) {
          // Send the saved state ONLY to the new user
          socket.emit("initial_state", room.roomState);
          console.log(`Sent initial state to ${socket.id}`);
        }
      } catch (err) {
        console.error("Error fetching room state:", err);
      }

      // Notify others in the room
      socket.to(roomId).emit("user_joined", { userId: socket.id });
    });

    // --- Real-Time Collaboration ---
    socket.on("collab_event", (data) => {
      const { roomId, payload } = data;
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(roomId).emit("collab_event", payload);
    });

    // Saving State  ---
    socket.on("update_state", async (data) => {
      const { roomId, roomState } = data; //The client sends the entire new state of the room

      try {
        console.log(`Saving state for room ${roomId}`);
        // Updates the document in MongoDB
        await Room.findOneAndUpdate(
          { roomId },
          { roomState: roomState, lastUpdated: new Date() }
        );
      } catch (err) {
        console.error("Error saving state:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Find which room this user was in and free the slot
      for (const roomId in roomParticipants) {
        const participants = roomParticipants[roomId];
        if (participants[0] === socket.id) {
          participants[0] = null;
          console.log(`Participant 0 disconnected from room ${roomId}`);
        } else if (participants[1] === socket.id) {
          participants[1] = null;
          console.log(`Participant 1 disconnected from room ${roomId}`);
        }

        // Cleanup empty rooms
        if (participants[0] === null && participants[1] === null) {
          delete roomParticipants[roomId];
        }
      }
    });
  });
};
