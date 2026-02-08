import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxx' })
  @IsString()
  shippingAddressId: string;

  @ApiProperty({ enum: PaymentMethod, example: 'PIX' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false, example: 'SEDEX' })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @ApiProperty({ required: false, example: 25.9 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingCost?: number;

  @ApiProperty({ required: false, example: 'DESCONTO10' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
