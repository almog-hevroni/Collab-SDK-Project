// backend/sockets/socketHandler.js

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    // --- אירועי חדרים ---

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);

      // הודעה לשאר המשתמשים בחדר
      socket.to(roomId).emit("user_joined", { userId: socket.id });
    });

    // --- אירועים גנריים (Collaborative Events) ---
    // השרת רק מעביר את המידע הלאה, הוא לא יודע מה יש בפנים
    socket.on("collab_event", (data) => {
      const { roomId, payload } = data;
      console.log(`Event in room ${roomId}`, payload);

      // שידור לכולם בחדר (חוץ מהשולח)
      socket.to(roomId).emit("collab_event", payload);
    });

    // --- ניתוק ---
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
