import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ required: false, example: 'Casa' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  street: string;

  @ApiProperty({ example: '123' })
  @IsString()
  number: string;

  @ApiProperty({ required: false, example: 'Apto 45' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @Length(2, 2)
  state: string;

  @ApiProperty({ example: '01234567' })
  @IsString()
  @Length(8, 8)
  zipCode: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
