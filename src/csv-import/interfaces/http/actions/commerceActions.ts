"use server";

import { api, validateCommerceHandler } from "@/src/csv-import/composition";
import { ValidateCommerceCommand } from "@/src/csv-import/application/commands/ValidateCommerceCommand";

export async function validateCommerceAction(data: { pcProcessdate: string }) {
  try {
    const command = new ValidateCommerceCommand(data);
    return validateCommerceHandler.execute(command);
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error : new Error("Validation failed"),
    };
  }
}

export async function getQuarantineAction() {
  try {
    const rows = await api.getQuarantineAll();
    return { success: true as const, data: rows };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error : new Error("Failed to fetch quarantine"),
    };
  }
}
