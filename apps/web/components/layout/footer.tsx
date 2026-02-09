import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const categories = [
  { name: 'Caixas de Som', slug: 'caixas-de-som' },
  { name: 'Fones de Ouvido', slug: 'fones-de-ouvido' },
  { name: 'Microfones', slug: 'microfones' },
  { name: 'Amplificadores', slug: 'amplificadores' },
  { name: 'Mesas de Som', slug: 'mesas-de-som' },
];

const institutionalLinks = [
  { name: 'Sobre Nós', href: '/sobre' },
  { name: 'Política de Privacidade', href: '/privacidade' },
  { name: 'Termos de Uso', href: '/termos' },
  { name: 'Trocas e Devoluções', href: '/trocas' },
  { name: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
];

const helpLinks = [
  { name: 'Central de Ajuda', href: '/ajuda' },
  { name: 'Como Comprar', href: '/como-comprar' },
  { name: 'Formas de Pagamento', href: '/pagamento' },
  { name: 'Prazo de Entrega', href: '/entrega' },
  { name: 'Rastrear Pedido', href: '/rastrear' },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo height={50} className="mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Sua loja especializada em equipamentos de áudio profissional. 
              Qualidade e tradição desde 2010.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link 
                    href={`/categoria/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2">
              {institutionalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@dominusaudio.com.br
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  Rua Exemplo, 123<br />
                  Centro - São Paulo/SP<br />
                  CEP: 01234-567
                </span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Seg a Sex: 9h às 18h<br />
              Sábado: 9h às 13h
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-5 w-5" />
              <span>Frete Grátis acima de R$ 299</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-5 w-5" />
              <span>Até 12x sem juros</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span>Compra 100% Segura</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Dominus Audio. Todos os direitos reservados.
            </p>
            <p className="mt-1">
              CNPJ: 00.000.000/0001-00
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
