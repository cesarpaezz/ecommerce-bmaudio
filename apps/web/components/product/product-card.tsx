'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { toast } from '@/lib/use-toast';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  brand?: string;
  isNew?: boolean;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  brand,
  isNew,
  inStock = true,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    addItem({
      productId: id,
      name,
      price,
      quantity: 1,
      image,
    });

    toast({
      title: 'Produto adicionado!',
      description: `${name} foi adicionado ao carrinho.`,
    });
  };

  return (
    <Link href={`/produto/${slug}`} className="group block">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}

        {isNew && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Novo
          </span>
        )}

        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{discount}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">
              Indisponível
            </span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {brand}
          </p>
        )}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{formatCurrency(price)}</span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(compareAtPrice)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          ou 12x de {formatCurrency(price / 12)}
        </p>
      </div>
    </Link>
  );
}
