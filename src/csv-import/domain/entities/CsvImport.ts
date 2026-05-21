import { Email } from "../value-objects/Email";
import { CsvImportException } from "../exceptions/CsvImportException";

export enum ImportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type CsvRow = Record<string, string>;

export type CsvImportProps = {
  id: string;
  filename: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  headers: string[];
  data: CsvRow[];
  errors: { row: number; message: string }[];
  status: ImportStatus;
  uploadedBy: Email;
  createdAt: Date;
  updatedAt: Date;
};

export class CsvImport {
  private constructor(private props: CsvImportProps) {}

  static create(props: {
    id: string;
    filename: string;
    headers: string[];
    data: CsvRow[];
    errors: { row: number; message: string }[];
    uploadedBy: Email;
  }): CsvImport {
    return new CsvImport({
      ...props,
      totalRows: props.data.length + props.errors.length,
      validRows: props.data.length,
      errorRows: props.errors.length,
      status: ImportStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: CsvImportProps): CsvImport {
    return new CsvImport(props);
  }

  markAsProcessing(): void {
    if (this.props.status !== ImportStatus.PENDING) {
      throw new CsvImportException("Only pending imports can be processed");
    }
    this.props.status = ImportStatus.PROCESSING;
    this.props.updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this.props.status !== ImportStatus.PROCESSING) {
      throw new CsvImportException("Only processing imports can be completed");
    }
    this.props.status = ImportStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = ImportStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get filename(): string {
    return this.props.filename;
  }

  get status(): ImportStatus {
    return this.props.status;
  }

  get totalRows(): number {
    return this.props.totalRows;
  }

  get validRows(): number {
    return this.props.validRows;
  }

  get errorRows(): number {
    return this.props.errorRows;
  }

  get headers(): string[] {
    return this.props.headers;
  }

  get data(): CsvRow[] {
    return this.props.data;
  }

  get errors(): { row: number; message: string }[] {
    return this.props.errors;
  }

  get uploadedBy(): Email {
    return this.props.uploadedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
