export type UploadCommerceDto = {
  file: File;
};

export type ValidateCommerceDto = {
  pcProcessdate: string;
};

export type UploadCommerceResponseDto = {
  success: boolean;
  message: string;
};

export type ValidateCommerceResponseDto = {
  success: boolean;
  insertedInQuarantine: number;
  message: string;
};

export type QuarantineRowDto = {
  pc_nomcomred: string;
  pc_numdoc: string;
  pc_processdate: string;
  motivo: string;
};

export type GetQuarantineDto = {
  pcProcessdate: string;
};
