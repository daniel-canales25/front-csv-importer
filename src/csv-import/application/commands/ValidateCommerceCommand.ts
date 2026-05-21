import { ValidateCommerceDto } from "../dto/CommerceDto";

export class ValidateCommerceCommand {
  readonly pcProcessdate: string;

  constructor(dto: ValidateCommerceDto) {
    if (!dto.pcProcessdate) {
      throw new Error("pcProcessdate is required");
    }
    this.pcProcessdate = dto.pcProcessdate;
  }
}
