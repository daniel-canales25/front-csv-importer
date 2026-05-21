function resolveBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
}

export const apiConfig = {
  baseUrl: resolveBaseUrl(),
  endpoints: {
    upload: "/api/commerce/upload",
    validate: "/api/commerce/validate",
    quarantine: "/api/commerce/quarantine",
  },
} as const;
