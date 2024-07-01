import { initServer } from "./webSocketServer";
import http from "http";

export const startWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  initServer(server);
};
