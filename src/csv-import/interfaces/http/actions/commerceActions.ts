"use server";

import { ValidateCommerceHandler } from "@/src/csv-import/application/handlers/ValidateCommerceHandler";
import { GetQuarantineHandler } from "@/src/csv-import/application/handlers/GetQuarantineHandler";
import { ValidateCommerceCommand } from "@/src/csv-import/application/commands/ValidateCommerceCommand";
import { GetQuarantineDto } from "@/src/csv-import/application/dto/CommerceDto";
import { CommerceApiService } from "@/src/csv-import/infrastructure/api/CommerceApiService";

const api = new CommerceApiService();
const validateHandler = new ValidateCommerceHandler(api);
const quarantineHandler = new GetQuarantineHandler(api);

export async function validateCommerceAction(data: { pcProcessdate: string }) {
  try {
    const command = new ValidateCommerceCommand(data);
    return validateHandler.execute(command);
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error : new Error("Validation failed"),
    };
  }
}

export async function getQuarantineAction(data: GetQuarantineDto) {
  return quarantineHandler.execute(data.pcProcessdate);
}
