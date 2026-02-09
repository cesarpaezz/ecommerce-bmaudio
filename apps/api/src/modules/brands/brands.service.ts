import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    return brand;
  }

  async create(data: { name: string; description?: string; logo?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Já existe uma marca com este nome');
    }

    return this.prisma.brand.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; logo?: string; isActive?: boolean }) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    let slug = brand.slug;
    if (data.name && data.name !== brand.name) {
      slug = slugify(data.name, { lower: true, strict: true });
      const existing = await this.prisma.brand.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Já existe uma marca com este nome');
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: { ...data, slug },
    });
  }

  async delete(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Marca removida com sucesso' };
  }
}
