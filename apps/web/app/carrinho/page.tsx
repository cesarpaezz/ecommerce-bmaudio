'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const shipping = total >= 299 ? 0 : 29.90;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">
          Adicione produtos ao carrinho para continuar comprando.
        </p>
        <Link href="/produtos">
          <Button size="lg">
            Ver Produtos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-muted/50 rounded-lg"
            >
              <div className="relative w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatCurrency(item.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={clearCart}>
              Limpar Carrinho
            </Button>
            <Link href="/produtos">
              <Button variant="ghost">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg">Resumo do Pedido</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                </span>
              </div>
              {total < 299 && (
                <p className="text-xs text-muted-foreground">
                  Faltam {formatCurrency(299 - total)} para frete grátis!
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ou 12x de {formatCurrency(finalTotal / 12)} sem juros
              </p>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Finalizar Compra
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Cupom de Desconto</h3>
            <div className="flex gap-2">
              <Input placeholder="Digite o cupom" />
              <Button variant="outline">Aplicar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
