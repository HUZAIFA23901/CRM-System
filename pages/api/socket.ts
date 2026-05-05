import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/socket";
import { getSocketServer } from "@/lib/socket";

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = getSocketServer(res.socket.server);
    res.socket.server.io = io ?? undefined;
  }
  res.end();
}
