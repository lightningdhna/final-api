// filepath: d:\datn\code\final\src\pipes\parse-date.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date | undefined> {
  constructor(private readonly options?: { optional?: boolean }) {}

  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): Date | undefined {
    if (value === undefined || value === null || value === '') {
      if (this.options?.optional) {
        return undefined;
      }
      throw new BadRequestException(`${metadata.data} should not be empty`);
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `${metadata.data} must be a valid date string (ISO 8601 recommended)`,
      );
    }
    return date;
  }
}
