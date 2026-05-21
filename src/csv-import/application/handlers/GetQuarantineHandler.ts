import { CommerceApi } from "../ports/CommerceApi";
import { QuarantineRowDto } from "../dto/CommerceDto";
import { Result, ok, fail } from "@/src/shared/types/result";

export class GetQuarantineHandler {
  constructor(private readonly api: CommerceApi) {}

  async execute(): Promise<Result<QuarantineRowDto[]>> {
    try {
      const rows = await this.api.getQuarantineAll();
      return ok(rows);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error("Failed to fetch quarantine"));
    }
  }
}
