"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/app/store/useSocketStore";

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket(); // Cleanup on unmount
  }, [connectSocket, disconnectSocket]);

  return <>{children}</>;
};

export default SocketProvider;
