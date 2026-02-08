import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getProductInventory(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Estoque não encontrado para este produto');
    }

    return inventory;
  }

  async adjustStock(productId: string, dto: AdjustStockDto, userId?: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundException('Estoque não encontrado');
    }

    const previousQty = inventory.quantity;
    let newQty: number;
    let movementType: MovementType;

    switch (dto.type) {
      case 'set':
        newQty = dto.quantity;
        movementType = MovementType.ADJUSTMENT;
        break;
      case 'add':
        newQty = previousQty + dto.quantity;
        movementType = MovementType.IN;
        break;
      case 'subtract':
        newQty = previousQty - dto.quantity;
        movementType = MovementType.OUT;
        break;
      default:
        throw new BadRequestException('Tipo de ajuste inválido');
    }

    if (newQty < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }

    const [updatedInventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { productId },
        data: { quantity: newQty },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: movementType,
          quantity: Math.abs(newQty - previousQty),
          previousQty,
          newQty,
          reason: dto.reason,
          createdBy: userId,
        },
      }),
    ]);

    return updatedInventory;
  }

  async reserveStock(productId: string, quantity: number, reference?: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundException('Estoque não encontrado');
    }

    const available = inventory.quantity - inventory.reservedQty;
    if (available < quantity) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${available}`,
      );
    }

    return this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { productId },
        data: { reservedQty: { increment: quantity } },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: MovementType.RESERVED,
          quantity,
          previousQty: inventory.quantity,
          newQty: inventory.quantity,
          reference,
          reason: 'Reserva para pedido',
        },
      }),
    ]);
  }

  async confirmReservation(productId: string, quantity: number, reference?: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundException('Estoque não encontrado');
    }

    const previousQty = inventory.quantity;
    const newQty = previousQty - quantity;

    return this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { productId },
        data: {
          quantity: newQty,
          reservedQty: { decrement: quantity },
        },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: MovementType.OUT,
          quantity,
          previousQty,
          newQty,
          reference,
          reason: 'Venda confirmada',
        },
      }),
    ]);
  }

  async releaseReservation(productId: string, quantity: number, reference?: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundException('Estoque não encontrado');
    }

    return this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { productId },
        data: { reservedQty: { decrement: quantity } },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: MovementType.RELEASED,
          quantity,
          previousQty: inventory.quantity,
          newQty: inventory.quantity,
          reference,
          reason: 'Reserva liberada',
        },
      }),
    ]);
  }

  async getLowStockProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: {
          quantity: { lte: this.prisma.inventory.fields.minQuantity },
        },
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, sku: true, price: true },
          },
        },
        orderBy: { quantity: 'asc' },
      }),
      this.prisma.inventory.count({
        where: {
          quantity: { lte: this.prisma.inventory.fields.minQuantity },
        },
      }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllInventory(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, sku: true, isActive: true },
          },
        },
        orderBy: { product: { name: 'asc' } },
      }),
      this.prisma.inventory.count(),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMovementHistory(inventoryId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { inventoryId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where: { inventoryId } }),
    ]);

    return {
      data: movements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
