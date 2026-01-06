const Room = require("../models/Room");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    // --- Joining a room + retrieving information---
    socket.on("join_room", async (roomId) => {
      socket.join(roomId); //This is a built-in Socket.io feature. It groups this user into a "channel" named after the room ID
      console.log(`User ${socket.id} joined room: ${roomId}`);

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
    });
  });
};
