export function emitLeadEvent(event: "lead_created" | "lead_assigned" | "lead_updated", payload: unknown) {
  if (global.ioServer) {
    global.ioServer.emit(event, payload);
  }
}
