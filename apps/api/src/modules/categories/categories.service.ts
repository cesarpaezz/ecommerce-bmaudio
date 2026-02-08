import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    return this.prisma.category.create({
      data: { ...dto, slug },
      include: { parent: true },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.category.findMany({
      where: { ...where, parentId: null },
      include: {
        children: {
          where,
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { where: { isActive: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      slug = slugify(dto.name, { lower: true, strict: true });
      const existing = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: { ...dto, slug },
      include: { parent: true, children: true },
    });
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        'Não é possível remover categoria com produtos vinculados',
      );
    }

    if (category._count.children > 0) {
      throw new ConflictException(
        'Não é possível remover categoria com subcategorias',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoria removida com sucesso' };
  }
}
