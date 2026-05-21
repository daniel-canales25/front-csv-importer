export class Email {
  private constructor(readonly value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
  }

  static create(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
