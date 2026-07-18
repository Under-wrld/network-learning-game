import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/** Parsing Zod estricto en el boundary HTTP (CLAUDE.md §4 módulo 27). */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      );
    }
    return result.data;
  }
}
