'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User, Heart, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { toast } from '@/lib/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: '',
      });
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get<{ data: Order[] }>('/orders/my', { token: token || undefined });
        setOrders(response.data || []);
      } catch {
        console.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [isAuthenticated, router, token, user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/users/profile', profileData, { token: token || undefined });
      toast({ title: 'Perfil atualizado!' });
    } catch {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' });
    }
  };

  if (!user) {
    return null;
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'enderecos', label: 'Endereços', icon: MapPin },
    { id: 'favoritos', label: 'Favoritos', icon: Heart },
  ];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Minha Conta</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </aside>

        <main className="lg:col-span-3">
          {activeTab === 'pedidos' && (
            <div className="bg-background rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Meus Pedidos</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
                  <Link href="/produtos">
                    <Button>Ver Produtos</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pedido #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getStatusLabel(order.status)}
                        </p>
                      </div>
                      <Link href={`/conta/pedido/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="bg-background rounded-lg border p-6">
              <h2 className="font-semibold mb-6">Meus Dados</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <Button type="submit">Salvar Alterações</Button>
              </form>

              <div className="border-t mt-8 pt-8">
                <h3 className="font-semibold mb-4">Alterar Senha</h3>
                <Link href="/conta/alterar-senha">
                  <Button variant="outline">Alterar Senha</Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'enderecos' && (
            <div className="bg-background rounded-lg border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold">Meus Endereços</h2>
                <Button>Adicionar Endereço</Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum endereço cadastrado.</p>
              </div>
            </div>
          )}

          {activeTab === 'favoritos' && (
            <div className="bg-background rounded-lg border p-6">
              <h2 className="font-semibold mb-6">Meus Favoritos</h2>
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4" />
                <p>Você ainda não tem produtos favoritos.</p>
                <Link href="/produtos" className="mt-4 inline-block">
                  <Button variant="outline">Ver Produtos</Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
