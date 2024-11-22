import { NextFunction, Request, Response } from "express";
import { Ok } from "../types/index.js";

export const clients: Map<number, Response> = new Map();
export function sendToAllClients(data: unknown) {
  const msgAsStr = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => res.write(msgAsStr));
}

export default class SSEController {
  public static async apiHandleEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Controll": "no-cache",
    };

    res.writeHead(200, headers);
    res.write(JSON.stringify(Ok({})));

    const clientId = Date.now();
    clients.set(clientId, res);

    req.on("close", () => {
      if (clients.delete(clientId)) {
        console.log(`Client ${clientId} connection closed`);
      } else {
        console.error(`Client ${clientId} failed to close connection`);
      }
    });
  }
}
