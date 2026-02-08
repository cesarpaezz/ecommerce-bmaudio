import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Carrinho')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obter carrinho' })
  getCart(
    @CurrentUser('id') userId: string | undefined,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  @Post('items')
  @Public()
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  addItem(
    @CurrentUser('id') userId: string | undefined,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, sessionId, dto);
  }

  @Patch('items/:itemId')
  @Public()
  @ApiOperation({ summary: 'Atualizar quantidade do item' })
  updateItem(
    @CurrentUser('id') userId: string | undefined,
    @Headers('x-session-id') sessionId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, sessionId, itemId, dto);
  }

  @Delete('items/:itemId')
  @Public()
  @ApiOperation({ summary: 'Remover item do carrinho' })
  removeItem(
    @CurrentUser('id') userId: string | undefined,
    @Headers('x-session-id') sessionId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, sessionId, itemId);
  }

  @Delete()
  @Public()
  @ApiOperation({ summary: 'Limpar carrinho' })
  clearCart(
    @CurrentUser('id') userId: string | undefined,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mesclar carrinho de visitante com usuário logado' })
  mergeCart(
    @CurrentUser('id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.mergeCart(sessionId, userId);
  }
}
