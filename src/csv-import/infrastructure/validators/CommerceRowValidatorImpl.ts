import { CommerceRowValidator, CommerceRow, RowValidationError } from "@/src/csv-import/application/validators/CommerceRowValidator";

export class CommerceRowValidatorImpl implements CommerceRowValidator {
  validate(row: CommerceRow, rowIndex: number): RowValidationError[] {
    const errors: RowValidationError[] = [];
    const rowNumber = rowIndex + 1;

    if (!row.pc_nomcomred || row.pc_nomcomred.trim() === "") {
      errors.push({
        row: rowNumber,
        field: "pc_nomcomred",
        message: "pc_nomcomred vacío",
      });
    }

    if (!row.pc_numdoc || row.pc_numdoc.trim() === "") {
      errors.push({
        row: rowNumber,
        field: "pc_numdoc",
        message: "pc_numdoc vacío",
      });
    } else if (!/^\d+$/.test(row.pc_numdoc.trim())) {
      errors.push({
        row: rowNumber,
        field: "pc_numdoc",
        message: "pc_numdoc contiene letras o caracteres especiales",
      });
    }

    return errors;
  }
}
