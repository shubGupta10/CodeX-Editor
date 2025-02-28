"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  sendCodeUpdate: (roomId: string, code: string) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connectSocket: () => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      set({ socket, isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      set({ socket: null, isConnected: false });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    set((state) => {
      state.socket?.disconnect();
      return { socket: null, isConnected: false };
    });
  },

  joinRoom: (roomId) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("joinRoom", { roomId });
      console.log(`🔗 Joined room: ${roomId}`);
    }
  },

  sendCodeUpdate: (roomId, code) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("codeUpdate", { roomId, code });
      console.log(`📤 Sent code update to room: ${roomId}`);
    }
  },
}));
