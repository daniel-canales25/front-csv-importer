export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}
