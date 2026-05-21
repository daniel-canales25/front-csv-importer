import { z } from "zod";

export const uploadCsvSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "File content is required"),
  uploadedBy: z.string().email("Must be a valid email"),
});
