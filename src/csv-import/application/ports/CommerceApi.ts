export interface UploadResponse {
  message: string;
}

export interface ValidateResponse {
  insertedInQuarantine: number;
}

export interface QuarantineRowResponse {
  id: number;
  pcNomcomred: string | null;
  pcNumdoc: string;
  pcProcessdate: string;
  categoria: string;
  marca: string;
  precio: string;
  stock: number;
  fechaVencimiento: string;
  motivo: string;
}

export interface CommerceApi {
  uploadCsv(file: File): Promise<UploadResponse>;
  validateByDate(pcProcessdate: string): Promise<ValidateResponse>;
  getQuarantineAll(): Promise<QuarantineRowResponse[]>;
}
