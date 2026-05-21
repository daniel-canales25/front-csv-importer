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

export type RowValidationError = {
  row: number;
  field: string;
  message: string;
};

export interface CommerceRowValidator {
  validate(row: CommerceRow, rowIndex: number): RowValidationError[];
}
