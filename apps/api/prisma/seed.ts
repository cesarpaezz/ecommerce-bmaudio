import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bmaudio.com.br' },
    update: {},
    create: {
      email: 'admin@bmaudio.com.br',
      password: adminPassword,
      name: 'Administrador',
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  const categories = [
    { name: 'Mesas de Som', description: 'Mixers analógicos e digitais' },
    { name: 'Microfones', description: 'Microfones vocais e instrumentais' },
    { name: 'Caixas de Som', description: 'Caixas ativas e passivas' },
    { name: 'Amplificadores', description: 'Amplificadores de potência' },
    { name: 'Periféricos', description: 'Processadores, equalizadores e compressores' },
    { name: 'Cabos e Conectores', description: 'Cabos de áudio e conectores' },
    { name: 'Iluminação', description: 'Equipamentos de iluminação para eventos' },
    { name: 'Acessórios', description: 'Pedestais, cases e acessórios diversos' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
        description: cat.description,
        isActive: true,
      },
    });
  }
  console.log('✅ Categorias criadas');

  const brands = [
    { name: 'Behringer', description: 'Equipamentos de áudio acessíveis' },
    { name: 'JBL', description: 'Áudio profissional de alta qualidade' },
    { name: 'Shure', description: 'Microfones e sistemas wireless' },
    { name: 'Yamaha', description: 'Instrumentos e equipamentos de áudio' },
    { name: 'Sennheiser', description: 'Microfones e fones de ouvido' },
    { name: 'QSC', description: 'Amplificadores e processadores' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.name.toLowerCase() },
      update: {},
      create: {
        name: brand.name,
        slug: brand.name.toLowerCase(),
        description: brand.description,
        isActive: true,
      },
    });
  }
  console.log('✅ Marcas criadas');

  const mesasSomCategory = await prisma.category.findUnique({
    where: { slug: 'mesas-de-som' },
  });
  const behringerBrand = await prisma.brand.findUnique({
    where: { slug: 'behringer' },
  });

  if (mesasSomCategory && behringerBrand) {
    const product = await prisma.product.upsert({
      where: { sku: 'X32-BEHRINGER' },
      update: {},
      create: {
        sku: 'X32-BEHRINGER',
        name: 'Mesa de Som Digital Behringer X32',
        slug: 'mesa-som-digital-behringer-x32',
        description:
          'Mesa de som digital de 40 canais com 32 pré-amplificadores MIDAS, 25 barramentos, 8 DCA e 6 matrizes. Interface de áudio USB 32x32 integrada.',
        shortDescription: 'Mesa digital 40 canais com pré MIDAS',
        price: 12999.99,
        comparePrice: 15999.99,
        categoryId: mesasSomCategory.id,
        brandId: behringerBrand.id,
        weight: 25,
        width: 90,
        height: 20,
        depth: 60,
        isActive: true,
        isFeatured: true,
        inventory: {
          create: {
            quantity: 10,
            minQuantity: 2,
          },
        },
      },
    });
    console.log('✅ Produto de exemplo criado:', product.name);
  }

  const settings = [
    { key: 'store_name', value: 'BM Audio', type: 'string' },
    { key: 'store_email', value: 'contato@bmaudio.com.br', type: 'string' },
    { key: 'store_phone', value: '(11) 99999-9999', type: 'string' },
    { key: 'free_shipping_min', value: '500', type: 'number' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Configurações criadas');

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
