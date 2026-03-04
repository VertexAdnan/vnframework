export {};

declare global {
  interface AppWebSocketData {
    room: string;
    createdAt: number;
    userId?: string;
  }

  interface Request {
    query: Record<string, string | string[] | undefined>;
  }
}