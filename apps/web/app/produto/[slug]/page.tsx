'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { toast } from '@/lib/use-toast';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: { id: string; url: string; alt?: string }[];
  brand?: { name: string };
  category?: { name: string; slug: string };
  variants: { id: string; name: string; sku: string; price: number; stock: number }[];
  inventory?: { quantity: number };
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.get<Product>(`/products/slug/${slug}`);
        setProduct(data);
        
        if (data.category) {
          const related = await api.get<{ data: Product[] }>(
            `/products?categoryId=${data.category}&limit=4`
          );
          setRelatedProducts(related.data.filter((p) => p.id !== data.id));
        }
      } catch {
        console.error('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant
      ? product.variants.find((v) => v.id === selectedVariant)
      : null;

    addItem({
      productId: product.id,
      variantId: selectedVariant || undefined,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      price: variant?.price || product.price,
      quantity,
      image: product.images[0]?.url,
    });

    toast({
      title: 'Produto adicionado!',
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Link href="/produtos" className="text-primary hover:underline mt-2 inline-block">
          Ver todos os produtos
        </Link>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const stock = product.inventory?.quantity || 0;
  const inStock = stock > 0;

  return (
    <div className="container py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/produtos" className="hover:text-foreground">Produtos</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/categoria/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                -{discount}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 shrink-0 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.brand.name}
            </p>
          )}
          
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground">
            ou 12x de {formatCurrency(product.price / 12)} sem juros
          </p>

          {product.variants.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Variação</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      selectedVariant === variant.id
                        ? 'border-primary bg-primary/10'
                        : 'border-input hover:border-primary'
                    }`}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                    {variant.stock === 0 && ' (Indisponível)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Quantidade</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {inStock ? `${stock} em estoque` : 'Indisponível'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs">Frete Grátis<br />acima de R$ 299</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs">Compra<br />100% Segura</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs">Troca Fácil<br />em 30 dias</p>
            </div>
          </div>

          {product.description && (
            <div className="pt-6 border-t">
              <h2 className="font-semibold mb-2">Descrição</h2>
              <div 
                className="text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                image={p.images[0]?.url}
                brand={p.brand?.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
