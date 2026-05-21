"use server";

import { ImportCsvHandler } from "@/src/csv-import/application/handlers/ImportCsvHandler";
import { ImportCsvCommand } from "@/src/csv-import/application/commands/ImportCsvCommand";
import { InMemoryCsvImportRepository } from "@/src/csv-import/infrastructure/persistence/repositories/InMemoryCsvImportRepository";
import { CsvParserImpl } from "@/src/csv-import/infrastructure/services/CsvParserImpl";
import { uploadCsvSchema } from "../validators/csvImportValidator";
import { UploadCsvDto } from "../../../application/dto/CsvDataDto";

const repository = new InMemoryCsvImportRepository();
const parser = new CsvParserImpl();
const handler = new ImportCsvHandler(repository, parser);

export async function uploadCsvAction(data: UploadCsvDto) {
  const parsed = uploadCsvSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const command = new ImportCsvCommand(parsed.data);
  return handler.execute(command);
}

export async function getAllImportsAction() {
  const imports = await repository.findAll();
  return imports.map((imp) => ({
    id: imp.id,
    filename: imp.filename,
    totalRows: imp.totalRows,
    validRows: imp.validRows,
    errorRows: imp.errorRows,
    headers: imp.headers,
    data: imp.data,
    errors: imp.errors,
    status: imp.status,
    uploadedBy: imp.uploadedBy.value,
    createdAt: imp.createdAt.toISOString(),
  }));
}

export async function getImportByIdAction(id: string) {
  const csvImport = await repository.findById(id);
  if (!csvImport) return null;
  return {
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
  };
}
