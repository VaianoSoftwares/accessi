import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

const wss = new WebSocketServer({ noServer: true });
export default wss;

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (msg) => {
    const msgAsStr = msg.toString();
    console.log("Received message from client", msgAsStr);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState !== WebSocket.OPEN) {
        ws.send(msgAsStr);
      }
    });
  });

  console.log("Connection to new client enstablished");
});

wss.on("upd-instrutt-list", () => {
  const ws: WebSocket | undefined = wss.clients.values().next().value;
  if (ws === undefined) {
    console.log("no clients");
    return;
  }

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState !== WebSocket.OPEN) {
      ws.send("");
    }
  });
});

export function WSOnUpgradeCb(
  req: IncomingMessage,
  sock: Duplex,
  head: Buffer
) {
  const pathname = req.url || "";
  if (pathname.startsWith("/ws/")) {
    wss.handleUpgrade(req, sock, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    sock.destroy();
  }
}
