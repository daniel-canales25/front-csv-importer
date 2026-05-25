export type CommercePrimitive = {
  pc_nomcomred: string;
  pc_numdoc: string;
  pc_processdate: string;
  categoria: string;
  marca: string;
  precio: string;
  stock: string;
  fecha_vencimiento: string;
};

export class Commerce {
  public readonly pc_nomcomred: string;
  public readonly pc_numdoc: string;
  public readonly pc_processdate: string;
  public readonly categoria: string;
  public readonly marca: string;
  public readonly precio: string;
  public readonly stock: string;
  public readonly fecha_vencimiento: string;

  constructor(data: CommercePrimitive) {
    if (!data.pc_nomcomred || data.pc_nomcomred.trim() === "") {
      throw new ValidationError("pc_nomcomred", "pc_nomcomred vacío");
    }
    if (!data.pc_numdoc || data.pc_numdoc.trim() === "") {
      throw new ValidationError("pc_numdoc", "pc_numdoc vacío");
    }
    if (!/^\d+$/.test(data.pc_numdoc.trim())) {
      throw new ValidationError("pc_numdoc", "pc_numdoc contiene letras o caracteres especiales");
    }
    this.pc_nomcomred = data.pc_nomcomred.trim();
    this.pc_numdoc = data.pc_numdoc.trim();
    this.pc_processdate = data.pc_processdate;
    this.categoria = data.categoria;
    this.marca = data.marca;
    this.precio = data.precio;
    this.stock = data.stock;
    this.fecha_vencimiento = data.fecha_vencimiento;
  }

  static tryCreate(data: CommercePrimitive): { commerce?: Commerce; errors?: { field: string; message: string }[] } {
    try {
      const commerce = new Commerce(data);
      return { commerce };
    } catch (err) {
      if (err instanceof ValidationError) {
        return { errors: [{ field: err.field, message: err.message }] };
      }
      throw err;
    }
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export type RowValidationError = {
  row: number;
  field: string;
  message: string;
};

export type UploadResult = {
  message: string;
};

export type ValidateResult = {
  insertedInQuarantine: number;
};
