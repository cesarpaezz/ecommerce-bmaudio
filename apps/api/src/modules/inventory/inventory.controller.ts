import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Estoque')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todo o estoque' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryService.getAllInventory(page, limit);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Listar produtos com estoque baixo' })
  getLowStock(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryService.getLowStockProducts(page, limit);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obter estoque de um produto' })
  getProductInventory(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventory(productId);
  }

  @Get(':inventoryId/movements')
  @ApiOperation({ summary: 'Histórico de movimentações' })
  getMovements(
    @Param('inventoryId') inventoryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getMovementHistory(inventoryId, page, limit);
  }

  @Post('product/:productId/adjust')
  @ApiOperation({ summary: 'Ajustar estoque de um produto' })
  adjustStock(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.adjustStock(productId, dto, userId);
  }
}
