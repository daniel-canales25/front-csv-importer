import { CommerceApiService } from "./infrastructure/api/CommerceApiService";
import { CommerceRowValidatorImpl } from "./infrastructure/validators/CommerceRowValidatorImpl";
import { ValidateCommerceHandler } from "./application/handlers/ValidateCommerceHandler";
import type { CommerceApi } from "./application/ports/CommerceApi";
import type { CommerceRowValidator } from "./domain/ports/CommerceRowValidator";

const api: CommerceApi = new CommerceApiService();
const validator: CommerceRowValidator = new CommerceRowValidatorImpl();

export const validateCommerceHandler = new ValidateCommerceHandler(api);
export { api, validator };
