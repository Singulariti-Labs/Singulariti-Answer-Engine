import express, { Request, Response } from "express";
import routes from "./routes/index";
import http from "http";
import cors from "cors";
import { startWebSocketServer } from "./websocket";

const PORT = process.env.PORT || 8200;
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/singulariti", routes);
app.get("/", (req: Request, res: Response) => {
  res.send("server started successfully!");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startWebSocketServer(server);
