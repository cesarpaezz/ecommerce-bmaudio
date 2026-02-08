'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  images: { url: string }[];
  category?: { name: string };
  brand?: { name: string };
  inventory?: { quantity: number };
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = useAuthStore((state) => state.token);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);

      const response = await api.get<ProductsResponse>(`/products?${params}`, { token: token || undefined });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      console.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [page, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      await api.delete(`/products/${id}`, { token: token || undefined });
      toast({ title: 'Produto excluído com sucesso!' });
      fetchProducts();
    } catch {
      toast({ title: 'Erro ao excluir produto', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-lg border">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Buscar</Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Produto</th>
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Categoria</th>
                <th className="text-left p-4 font-medium">Preço</th>
                <th className="text-left p-4 font-medium">Estoque</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-32" />
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-12" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-muted rounded overflow-hidden">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{product.sku}</td>
                    <td className="p-4 text-sm">{product.category?.name || '-'}</td>
                    <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        (product.inventory?.quantity || 0) <= 5 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {product.inventory?.quantity || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/produtos/${product.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
