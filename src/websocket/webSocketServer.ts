import { WebSocketServer } from "ws";
import http from "http";
import { TypeOf } from "zod";
import { handleConnection } from "./connectionManager";

const PORT = process.env.PORT || 8200;

export const initServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    handleConnection(ws);
  });

  console.log(`Webocket server started on port ${PORT}`);
};
