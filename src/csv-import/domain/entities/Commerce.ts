export type CommerceRow = {
  pc_nomcomred: string;
  pc_numdoc: string;
  pc_processdate: string;
  categoria: string;
  marca: string;
  precio: string;
  stock: string;
  fecha_vencimiento: string;
};

export type UploadResult = {
  message: string;
};

export type ValidateResult = {
  insertedInQuarantine: number;
};
