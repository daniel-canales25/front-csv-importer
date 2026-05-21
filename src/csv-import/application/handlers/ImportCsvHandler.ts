import { CsvImportRepository } from "@/src/csv-import/domain/repositories/CsvImportRepository";
import { CsvImport } from "@/src/csv-import/domain/entities/CsvImport";
import { CsvParser } from "../ports/CsvParser";
import { ImportCsvCommand } from "../commands/ImportCsvCommand";
import { CsvImportResponseDto } from "../dto/CsvDataDto";
import { generateId } from "@/src/shared/utils/idGenerator";
import { Result, ok, fail } from "@/src/shared/types/result";

export class ImportCsvHandler {
  constructor(
    private readonly repository: CsvImportRepository,
    private readonly parser: CsvParser,
  ) {}

  async execute(command: ImportCsvCommand): Promise<Result<CsvImportResponseDto>> {
    try {
      const parseResult = this.parser.parse(command.content);

      const csvImport = CsvImport.create({
        id: generateId(),
        filename: command.filename,
        headers: parseResult.headers,
        data: parseResult.data,
        errors: parseResult.errors,
        uploadedBy: command.uploadedBy,
      });

      await this.repository.save(csvImport);

      return ok({
        id: csvImport.id,
        filename: csvImport.filename,
        totalRows: csvImport.totalRows,
        validRows: csvImport.validRows,
        errorRows: csvImport.errorRows,
        headers: csvImport.headers,
        data: csvImport.data,
        errors: csvImport.errors,
        status: csvImport.status,
        uploadedBy: csvImport.uploadedBy.value,
        createdAt: csvImport.createdAt.toISOString(),
      });
    } catch (error) {
      return fail(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}
