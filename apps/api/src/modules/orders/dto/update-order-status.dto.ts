import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: 'SHIPPED' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ required: false, example: 'Pedido enviado via Correios' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false, example: 'BR123456789BR' })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
