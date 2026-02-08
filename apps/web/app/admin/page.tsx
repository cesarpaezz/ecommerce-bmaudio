'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string };
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/orders/dashboard', { token: token || undefined });
        setStats(data);
      } catch {
        console.error('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: DollarSign,
      label: 'Receita Total',
      value: formatCurrency(stats?.totalRevenue || 0),
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: ShoppingCart,
      label: 'Total de Pedidos',
      value: stats?.totalOrders || 0,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Users,
      label: 'Clientes',
      value: stats?.totalCustomers || 0,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: Package,
      label: 'Pedidos Pendentes',
      value: stats?.pendingOrders || 0,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-background rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(stats?.lowStockProducts || 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">
            {stats?.lowStockProducts} produto(s) com estoque baixo. 
            <a href="/admin/estoque" className="underline ml-1">Verificar</a>
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Pedidos Recentes</h2>
          </div>
          <div className="divide-y">
            {stats?.recentOrders?.length ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <p className={`text-sm ${
                      order.status === 'PENDING' ? 'text-yellow-600' :
                      order.status === 'PAID' ? 'text-green-600' :
                      order.status === 'SHIPPED' ? 'text-blue-600' :
                      'text-muted-foreground'
                    }`}>
                      {order.status === 'PENDING' && 'Pendente'}
                      {order.status === 'PAID' && 'Pago'}
                      {order.status === 'SHIPPED' && 'Enviado'}
                      {order.status === 'DELIVERED' && 'Entregue'}
                      {order.status === 'CANCELLED' && 'Cancelado'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-muted-foreground text-center">
                Nenhum pedido ainda
              </p>
            )}
          </div>
        </div>

        <div className="bg-background rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Ações Rápidas</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <a
              href="/admin/produtos/novo"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Novo Produto</p>
            </a>
            <a
              href="/admin/pedidos"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Ver Pedidos</p>
            </a>
            <a
              href="/admin/estoque"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Estoque</p>
            </a>
            <a
              href="/admin/clientes"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Clientes</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
