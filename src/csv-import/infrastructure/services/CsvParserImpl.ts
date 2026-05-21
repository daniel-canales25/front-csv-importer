import Papa from "papaparse";
import { CsvParser, ParseResult } from "@/src/csv-import/application/ports/CsvParser";
import { CsvRow } from "@/src/csv-import/domain/entities/CsvImport";

export class CsvParserImpl implements CsvParser {
  parse(content: string): ParseResult {
    const result = Papa.parse<CsvRow>(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const errors: { row: number; message: string }[] = result.errors.map((e) => ({
      row: (e.row ?? 0) + 1,
      message: e.message,
    }));

    return {
      headers: result.meta.fields ?? [],
      data: result.data.filter((_, index) => {
        return !errors.some((e) => e.row === index + 1);
      }),
      errors,
    };
  }
}
