import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { CategoryIcon } from '@/components/ui/category-icon';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Equipamentos de Áudio Profissional
            </h1>
            <p className="text-xl text-neutral-300 mb-8">
              Tudo que você precisa para sonorização de eventos, estúdios e igrejas.
              Qualidade profissional com os melhores preços.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/produtos">Ver Produtos</Link>
              </Button>
              <Button size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-neutral-900 transition-colors" asChild>
                <Link href="/contato">Fale Conosco</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category: any) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-center mb-4 text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  <CategoryIcon slug={category.slug} className="h-12 w-12" />
                </div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category._count?.products || 0} produtos
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
            <Button variant="outline" asChild>
              <Link href="/produtos">Ver Todos</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAtPrice={product.comparePrice}
                  image={product.images?.[0]?.url}
                  brand={product.brand?.name}
                />
              ))
            ) : (
              <p className="col-span-4 text-center text-muted-foreground py-10">
                Nenhum produto em destaque no momento.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">Frete Grátis</h3>
              <p className="text-sm text-muted-foreground">
                Para compras acima de R$ 500
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Cartão, Pix e Boleto
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-semibold mb-2">Garantia</h3>
              <p className="text-sm text-muted-foreground">
                Produtos com garantia de fábrica
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">Suporte</h3>
              <p className="text-sm text-muted-foreground">
                Atendimento especializado
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
