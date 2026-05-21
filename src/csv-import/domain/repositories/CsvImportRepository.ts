import { CsvImport } from "../entities/CsvImport";

export interface CsvImportRepository {
  save(importEntity: CsvImport): Promise<void>;
  findById(id: string): Promise<CsvImport | null>;
  findAll(): Promise<CsvImport[]>;
  delete(id: string): Promise<void>;
}
