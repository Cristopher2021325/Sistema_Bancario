// Error controlado: lleva el código HTTP que se devolverá al cliente.
export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
export const badRequest = (m: string) => new AppError(400, m);
export const notFound = (m: string) => new AppError(404, m);
export const conflict = (m: string) => new AppError(409, m);
export const unauthorized = (m: string) => new AppError(401, m);
export const forbidden = (m: string) => new AppError(403, m);
