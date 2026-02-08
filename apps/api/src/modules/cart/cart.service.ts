import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Usuário ou sessão necessários');
    }

    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
                inventory: { select: { quantity: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: userId ? { userId } : { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isMain: true }, take: 1 },
                  inventory: { select: { quantity: true } },
                },
              },
            },
          },
        },
      });
    }

    return this.formatCart(cart);
  }

  async addItem(userId: string | undefined, sessionId: string | undefined, dto: AddToCartDto) {
    const cart = await this.getOrCreateCartRaw(userId, sessionId);

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { inventory: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Produto não encontrado ou indisponível');
    }

    const availableStock = product.inventory
      ? product.inventory.quantity - product.inventory.reservedQty
      : 0;

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    const totalQuantity = (existingItem?.quantity || 0) + dto.quantity;

    if (totalQuantity > availableStock) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${availableStock}`,
      );
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          price: product.price,
        },
      });
    }

    return this.getOrCreateCart(userId, sessionId);
  }

  async updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCartRaw(userId, sessionId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: { include: { inventory: true } } },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    if (dto.quantity === 0) {
      return this.removeItem(userId, sessionId, itemId);
    }

    const availableStock = item.product.inventory
      ? item.product.inventory.quantity - item.product.inventory.reservedQty
      : 0;

    if (dto.quantity > availableStock) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${availableStock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getOrCreateCart(userId, sessionId);
  }

  async removeItem(userId: string | undefined, sessionId: string | undefined, itemId: string) {
    const cart = await this.getOrCreateCartRaw(userId, sessionId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId: string | undefined, sessionId: string | undefined) {
    const cart = await this.getOrCreateCartRaw(userId, sessionId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Carrinho limpo com sucesso', items: [], subtotal: 0 };
  }

  async mergeCart(sessionId: string, userId: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId, undefined);
    }

    let userCart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      await this.prisma.cart.update({
        where: { sessionId },
        data: { userId, sessionId: null },
      });
    } else {
      for (const item of guestCart.items) {
        const existingItem = await this.prisma.cartItem.findUnique({
          where: {
            cartId_productId: { cartId: userCart.id, productId: item.productId },
          },
        });

        if (existingItem) {
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          });
        }
      }

      await this.prisma.cart.delete({ where: { sessionId } });
    }

    return this.getOrCreateCart(userId, undefined);
  }

  private async getOrCreateCartRaw(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Usuário ou sessão necessários');
    }

    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: userId ? { userId } : { sessionId },
      });
    }

    return cart;
  }

  private formatCart(cart: any) {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.price) * item.quantity,
      image: item.product.images[0]?.url || null,
      stock: item.product.inventory?.quantity || 0,
    }));

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    return {
      id: cart.id,
      items,
      itemCount: items.length,
      totalQuantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal,
    };
  }
}
