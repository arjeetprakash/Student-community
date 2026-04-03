import { io } from "socket.io-client";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://student-community-j7iy.onrender.com").replace(/\/$/, "");

let chatSocket = null;
let activeToken = null;

export function connectChatSocket(token) {
  if (!token) {
    return null;
  }

  if (chatSocket && activeToken === token) {
    return chatSocket;
  }

  if (chatSocket) {
    chatSocket.disconnect();
  }

  activeToken = token;
  chatSocket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true
  });

  return chatSocket;
}

export function getChatSocket() {
  return chatSocket;
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.disconnect();
  }

  chatSocket = null;
  activeToken = null;
}
