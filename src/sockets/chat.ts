export default {
  onMessage(
    ws: Bun.ServerWebSocket<AppWebSocketData>,
    message: unknown,
    _server: unknown
  ) {
    ws.publish("chat", `Mesaj geldi: ${String(message)}`);
  }
}