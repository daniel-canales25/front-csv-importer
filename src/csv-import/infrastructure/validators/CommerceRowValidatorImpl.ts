import { CommerceRowValidator } from "@/src/csv-import/domain/ports/CommerceRowValidator";
import { CommercePrimitive, RowValidationError, Commerce } from "@/src/csv-import/domain/entities/Commerce";

export class CommerceRowValidatorImpl implements CommerceRowValidator {
  validate(row: CommercePrimitive, rowIndex: number): RowValidationError[] {
    const errors: RowValidationError[] = [];
    const rowNumber = rowIndex + 1;

    const result = Commerce.tryCreate(row);
    if (result.errors) {
      for (const err of result.errors) {
        errors.push({
          row: rowNumber,
          field: err.field,
          message: err.message,
        });
      }
    }

    return errors;
  }
}
