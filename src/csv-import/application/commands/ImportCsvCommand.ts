import { Email } from "@/src/csv-import/domain/value-objects/Email";
import { UploadCsvDto } from "../dto/CsvDataDto";

export class ImportCsvCommand {
  readonly filename: string;
  readonly content: string;
  readonly uploadedBy: Email;

  constructor(dto: UploadCsvDto) {
    this.filename = dto.filename;
    this.content = dto.content;
    this.uploadedBy = Email.create(dto.uploadedBy);
  }
}
