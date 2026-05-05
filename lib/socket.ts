import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

declare global {
  // eslint-disable-next-line no-var
  var ioServer: IOServer | undefined;
}

export function getSocketServer(httpServer?: HTTPServer) {
  if (global.ioServer) return global.ioServer;
  if (!httpServer) return null;
  const io = new IOServer(httpServer, {
    path: "/api/socket",
    cors: { origin: "*" }
  });
  global.ioServer = io;
  return io;
}
