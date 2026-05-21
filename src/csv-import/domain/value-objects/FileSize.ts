export class FileSize {
  private constructor(readonly bytes: number) {
    if (bytes < 0) {
      throw new Error("FileSize cannot be negative");
    }
  }

  static create(bytes: number): FileSize {
    return new FileSize(bytes);
  }

  get megabytes(): number {
    return this.bytes / (1024 * 1024);
  }

  get kilobytes(): number {
    return this.bytes / 1024;
  }

  equals(other: FileSize): boolean {
    return this.bytes === other.bytes;
  }
}
