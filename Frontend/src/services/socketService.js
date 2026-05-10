import { io } from "socket.io-client";
import { CONFIG } from "../constant/config";

const socket = io(CONFIG.API_URL, { transports: ["websocket"] });

export const socketService = {
    joinEvent: (eventId) => socket.emit("joinEvent", eventId),
    leaveEvent: (eventId) => socket.emit("leaveEvent", eventId),
    sendMessage: (msg) => socket.emit("newMessage", msg),
    onMessage: (callback) => socket.on("newMessage", callback),
};
