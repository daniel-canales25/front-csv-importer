import { CsvImport } from "@/src/csv-import/domain/entities/CsvImport";
import { CsvImportRepository } from "@/src/csv-import/domain/repositories/CsvImportRepository";

export class InMemoryCsvImportRepository implements CsvImportRepository {
  private imports: Map<string, CsvImport> = new Map();

  async save(importEntity: CsvImport): Promise<void> {
    this.imports.set(importEntity.id, importEntity);
  }

  async findById(id: string): Promise<CsvImport | null> {
    return this.imports.get(id) ?? null;
  }

  async findAll(): Promise<CsvImport[]> {
    return Array.from(this.imports.values());
  }

  async delete(id: string): Promise<void> {
    this.imports.delete(id);
  }
}
