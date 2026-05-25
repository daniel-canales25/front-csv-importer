import { CommercePrimitive, RowValidationError } from "../entities/Commerce";

export interface CommerceRowValidator {
  validate(row: CommercePrimitive, rowIndex: number): RowValidationError[];
}
