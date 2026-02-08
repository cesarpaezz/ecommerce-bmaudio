import { IsNumber, IsString, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @ApiProperty({
    enum: ['set', 'add', 'subtract'],
    example: 'set',
    description: 'set = definir valor, add = adicionar, subtract = subtrair',
  })
  @IsString()
  @IsIn(['set', 'add', 'subtract'])
  type: 'set' | 'add' | 'subtract';

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ required: false, example: 'Entrada de mercadoria NF 12345' })
  @IsOptional()
  @IsString()
  reason?: string;
}
