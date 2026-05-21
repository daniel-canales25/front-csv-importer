import { CsvRow } from "@/src/csv-import/domain/entities/CsvImport";

export type UploadCsvDto = {
  filename: string;
  content: string;
  uploadedBy: string;
};

export type CsvImportResponseDto = {
  id: string;
  filename: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  headers: string[];
  data: CsvRow[];
  errors: { row: number; message: string }[];
  status: string;
  uploadedBy: string;
  createdAt: string;
};
