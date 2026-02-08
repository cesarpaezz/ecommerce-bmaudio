import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}
