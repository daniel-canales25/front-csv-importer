import { CommerceApi, UploadResponse, ValidateResponse, QuarantineRowResponse } from "@/src/csv-import/application/ports/CommerceApi";
import { apiConfig } from "../config/apiConfig";

export class CommerceApiService implements CommerceApi {
  async uploadCsv(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.upload}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message ?? `HTTP ${response.status}`);
    }

    return response.json();
  }

  async validateByDate(pcProcessdate: string): Promise<ValidateResponse> {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.validate}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pcProcessdate }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Validation failed" }));
      throw new Error(error.message ?? `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getQuarantineAll(): Promise<QuarantineRowResponse[]> {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.quarantine}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
}
