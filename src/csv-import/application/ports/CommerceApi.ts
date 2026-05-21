export interface UploadResponse {
  message: string;
}

export interface ValidateResponse {
  insertedInQuarantine: number;
}

export interface QuarantineRowResponse {
  pc_nomcomred: string;
  pc_numdoc: string;
  pc_processdate: string;
  motivo: string;
}

export interface CommerceApi {
  uploadCsv(file: File): Promise<UploadResponse>;
  validateByDate(pcProcessdate: string): Promise<ValidateResponse>;
  getQuarantineByDate(pcProcessdate: string): Promise<QuarantineRowResponse[]>;
}
