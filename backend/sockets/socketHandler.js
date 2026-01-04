// backend/sockets/socketHandler.js

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    //Join a room
    socket.on("join_room", (roomId) => {
      socket.join(roomId); //This is a built-in Socket.io feature. It groups this user into a "channel" named after the room ID
      console.log(`User ${socket.id} joined room: ${roomId}`);

      //Send a message to all other users in the room
      socket.to(roomId).emit("user_joined", { userId: socket.id });
    });

    //Handling Collaborative Events (The Core Logic)
    socket.on("collab_event", (data) => {
      const { roomId, payload } = data;
      console.log(`Event in room ${roomId}`, payload);

      //Send the event to all other users in the room
      socket.to(roomId).emit("collab_event", payload);
    });

    //Disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
