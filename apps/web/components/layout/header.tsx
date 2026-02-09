'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { useCartStore } from '@/lib/store';

const categories = [
  { name: 'Caixas de Som', slug: 'caixas-de-som' },
  { name: 'Fones de Ouvido', slug: 'fones-de-ouvido' },
  { name: 'Microfones', slug: 'microfones' },
  { name: 'Amplificadores', slug: 'amplificadores' },
  { name: 'Mesas de Som', slug: 'mesas-de-som' },
  { name: 'Cabos e Conectores', slug: 'cabos-conectores' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItemsCount = useCartStore((state) => state.items.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/produtos?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="bg-primary text-primary-foreground text-sm py-2">
        <div className="container text-center">
          Frete grátis para compras acima de R$ 299 | Parcele em até 12x sem juros
        </div>
      </div>

      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Logo height={40} />
          </Link>

          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link href="/favoritos">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/conta">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <form 
          onSubmit={handleSearch}
          className="mt-4 md:hidden"
        >
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      <nav className="hidden md:block border-t bg-muted/50">
        <div className="container">
          <ul className="flex items-center gap-1">
            <li className="group relative">
              <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:text-primary transition-colors">
                Categorias
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-background border rounded-md shadow-lg min-w-[200px] py-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categoria/${category.slug}`}
                    className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </li>
            <li>
              <Link 
                href="/produtos" 
                className="block px-4 py-3 text-sm font-medium hover:text-primary transition-colors"
              >
                Todos os Produtos
              </Link>
            </li>
            <li>
              <Link 
                href="/lancamentos" 
                className="block px-4 py-3 text-sm font-medium hover:text-primary transition-colors"
              >
                Lançamentos
              </Link>
            </li>
            <li>
              <Link 
                href="/ofertas" 
                className="block px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Ofertas
              </Link>
            </li>
            <li>
              <Link 
                href="/contato" 
                className="block px-4 py-3 text-sm font-medium hover:text-primary transition-colors"
              >
                Contato
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4">
            <ul className="space-y-2">
              <li className="font-medium text-muted-foreground text-sm mb-2">
                Categorias
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="block py-2 text-sm hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li className="border-t pt-2 mt-4">
                <Link
                  href="/produtos"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/lancamentos"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lançamentos
                </Link>
              </li>
              <li>
                <Link
                  href="/ofertas"
                  className="block py-2 text-sm font-medium text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
