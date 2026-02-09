import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const { images, initialStock, minStock, slug: dtoSlug, ...productData } = dto;
    
    const baseSlug = dtoSlug || slugify(dto.name, { lower: true, strict: true });

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: baseSlug },
    });

    const finalSlug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        slug: finalSlug,
        inventory: {
          create: {
            quantity: initialStock || 0,
            minQuantity: minStock || 5,
          },
        },
        images: images?.length ? {
          create: images.map((img, index) => ({
            url: img.url,
            alt: img.alt || null,
            sortOrder: img.sortOrder ?? index,
            isMain: img.isMain ?? index === 0,
          })),
        } : undefined,
      },
      include: {
        category: true,
        brand: true,
        inventory: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return product;
  }

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      isActive = true,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          inventory: { select: { quantity: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventory: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const avgRating = await this.prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
    });

    return {
      ...product,
      averageRating: avgRating._avg.rating || 0,
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const { images, initialStock, minStock, ...updateData } = dto as any;

    let slug = product.slug;
    if (dto.name && dto.name !== product.name) {
      slug = slugify(dto.name, { lower: true, strict: true });
      const existingSlug = await this.prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...updateData, slug },
      include: {
        category: true,
        brand: true,
        images: true,
        inventory: true,
      },
    });
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produto removido com sucesso' };
  }

  async addImages(productId: string, images: { url: string; alt?: string }[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const maxOrder = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });

    const startOrder = (maxOrder._max.sortOrder || 0) + 1;

    const imageData = images.map((img, index) => ({
      productId,
      url: img.url,
      alt: img.alt,
      sortOrder: startOrder + index,
      isMain: startOrder === 1 && index === 0,
    }));

    await this.prisma.productImage.createMany({ data: imageData });

    return this.findById(productId);
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Imagem removida com sucesso' };
  }

  async getFeatured(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: limit,
      include: {
        images: { where: { isMain: true }, take: 1 },
        inventory: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRelated(productId: string, limit = 4) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) return [];

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        NOT: { id: productId },
      },
      take: limit,
      include: {
        images: { where: { isMain: true }, take: 1 },
      },
    });
  }
}
