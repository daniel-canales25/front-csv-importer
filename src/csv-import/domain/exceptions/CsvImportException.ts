import { AppError } from "@/src/shared/errors/AppError";

export class CsvImportException extends AppError {
  constructor(message: string) {
    super(message, "CSV_IMPORT_ERROR");
    this.name = "CsvImportException";
  }
}
