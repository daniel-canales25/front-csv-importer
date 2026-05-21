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
};
