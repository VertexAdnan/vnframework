export {};

declare global {
  interface Request {
    query: Record<string, string | string[] | undefined>;
  }
}