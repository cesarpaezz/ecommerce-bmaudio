'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/product-card';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string }[];
  brand?: { name: string };
  isActive: boolean;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sortBy,
          sortOrder,
        });

        if (query) params.set('search', query);
        if (priceMin) params.set('priceMin', priceMin);
        if (priceMax) params.set('priceMax', priceMax);

        const response = await api.get<ProductsResponse>(`/products?${params}`);
        setProducts(response.data);
        setTotalPages(response.meta.totalPages);
      } catch {
        console.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortBy, sortOrder, query, priceMin, priceMax]);

  const handleSort = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {query ? `Resultados para "${query}"` : 'Todos os Produtos'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {products.length} produtos encontrados
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar:</span>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background"
              onChange={(e) => handleSort(e.target.value)}
              value={`${sortBy}-${sortOrder}`}
            >
              <option value="createdAt-desc">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="bg-muted/50 rounded-lg p-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Faixa de Preço</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Categorias</h3>
              <ul className="space-y-2">
                {['Caixas de Som', 'Fones de Ouvido', 'Microfones', 'Amplificadores'].map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Marcas</h3>
              <ul className="space-y-2">
                {['JBL', 'Sony', 'Shure', 'Audio-Technica'].map((brand) => (
                  <li key={brand}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" className="w-full" onClick={() => {
              setPriceMin('');
              setPriceMax('');
            }}>
              Limpar Filtros
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-square rounded-lg" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    image={product.images[0]?.url}
                    brand={product.brand?.name}
                    inStock={product.isActive}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
