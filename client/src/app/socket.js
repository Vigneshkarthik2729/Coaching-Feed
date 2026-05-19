  import { io } from "socket.io-client";

  let socket = null;

  export const getSocket = () => {
    if (!socket) {
      socket = io("https://coaching-feed-vfui.onrender.com", {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event listeners for debugging
      socket.on("connect", () => {
        console.log("✓ Socket connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("✗ Socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.error("✗ Socket connection error:", error);
      });

      socket.on("error", (error) => {
        console.error("✗ Socket error:", error);
      });
    }
    return socket;
  };