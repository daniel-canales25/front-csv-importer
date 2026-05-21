import { CsvRow } from "@/src/csv-import/domain/entities/CsvImport";

export type ParseResult = {
  headers: string[];
  data: CsvRow[];
  errors: { row: number; message: string }[];
};

export interface CsvParser {
  parse(content: string): ParseResult;
}
