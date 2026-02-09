import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private cartService: CartService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.getOrCreateCart(userId, undefined);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Carrinho está vazio');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    for (const item of cart.items) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory) {
        throw new BadRequestException(`Produto ${item.name} sem estoque`);
      }

      const available = inventory.quantity - inventory.reservedQty;
      if (available < item.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para ${item.name}. Disponível: ${available}`,
        );
      }
    }

    const orderNumber = await this.generateOrderNumber();

    const subtotal = cart.subtotal;
    const shippingCost = dto.shippingCost || 0;
    let discount = 0;

    if (dto.couponCode) {
      const coupon = await this.validateCoupon(dto.couponCode, subtotal);
      if (coupon) {
        discount =
          coupon.type === 'PERCENTAGE'
            ? Math.min(
                (subtotal * Number(coupon.value)) / 100,
                coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity,
              )
            : Number(coupon.value);
      }
    }

    const total = subtotal + shippingCost - discount;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          shippingCost,
          discount,
          total,
          shippingAddressId: dto.shippingAddressId,
          shippingMethod: dto.shippingMethod,
          notes: dto.notes,
          items: {
            create: cart.items.map((item: any) => ({
              productId: item.productId,
              productName: item.name,
              productSku: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.subtotal,
            })),
          },
          payment: {
            create: {
              method: dto.paymentMethod as PaymentMethod,
              status: PaymentStatus.PENDING,
              amount: total,
            },
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              comment: 'Pedido criado',
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shippingAddress: true,
        },
      });

      for (const item of cart.items) {
        await this.inventoryService.reserveStock(
          item.productId,
          item.quantity,
          newOrder.id,
        );
      }

      await tx.cartItem.deleteMany({
        where: { cart: { userId } },
      });

      return newOrder;
    });

    return order;
  }

  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { take: 3 },
          payment: { select: { method: true, status: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isMain: true }, take: 1 } },
              },
            },
          },
          payment: { select: { method: true, status: true } },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: { where: { isMain: true }, take: 1 } },
            },
          },
        },
        payment: true,
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este pedido');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, adminId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const updateData: any = { status: dto.status };

    switch (dto.status) {
      case OrderStatus.PAYMENT_CONFIRMED:
        updateData.paidAt = new Date();
        for (const item of order.items) {
          if (item.productId) {
            await this.inventoryService.confirmReservation(
              item.productId,
              item.quantity,
              order.id,
            );
          }
        }
        break;
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        if (dto.trackingCode) {
          updateData.trackingCode = dto.trackingCode;
        }
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        for (const item of order.items) {
          if (item.productId) {
            await this.inventoryService.releaseReservation(
              item.productId,
              item.quantity,
              order.id,
            );
          }
        }
        break;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status: dto.status,
            comment: dto.comment,
            createdBy: adminId,
          },
        },
      },
      include: {
        items: true,
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updatedOrder;
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      monthRevenue,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      monthRevenue: monthRevenue._sum.total || 0,
      recentOrders,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: `BM-${year}` } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `BM-${year}-${sequence.toString().padStart(5, '0')}`;
  }

  private async validateCoupon(code: string, orderValue: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) return null;
    if (!coupon.isActive) return null;
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
    if (coupon.startsAt && coupon.startsAt > new Date()) return null;
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return null;
    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) return null;

    return coupon;
  }
}
