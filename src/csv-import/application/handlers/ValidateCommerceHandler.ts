import { CommerceApi } from "../ports/CommerceApi";
import { ValidateCommerceCommand } from "../commands/ValidateCommerceCommand";
import { ValidateCommerceResponseDto } from "../dto/CommerceDto";
import { Result, ok, fail } from "@/src/shared/types/result";

export class ValidateCommerceHandler {
  constructor(private readonly api: CommerceApi) {}

  async execute(command: ValidateCommerceCommand): Promise<Result<ValidateCommerceResponseDto>> {
    try {
      const response = await this.api.validateByDate(command.pcProcessdate);
      return ok({
        success: true,
        insertedInQuarantine: response.insertedInQuarantine,
        message:
          response.insertedInQuarantine > 0
            ? `Se movieron ${response.insertedInQuarantine} registros a cuarentena`
            : "Todos los registros son válidos",
      });
    } catch (error) {
      return fail(error instanceof Error ? error : new Error("Validation failed"));
    }
  }
}
