'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

const ORIGEM_OPTIONS = [
  { value: '0', label: '0 - Nacional' },
  { value: '1', label: '1 - Estrangeira (importação direta)' },
  { value: '2', label: '2 - Estrangeira (adquirida no mercado interno)' },
  { value: '3', label: '3 - Nacional com conteúdo de importação > 40%' },
  { value: '4', label: '4 - Nacional (processos produtivos básicos)' },
  { value: '5', label: '5 - Nacional com conteúdo de importação ≤ 40%' },
  { value: '6', label: '6 - Estrangeira (importação direta) sem similar nacional' },
  { value: '7', label: '7 - Estrangeira (mercado interno) sem similar nacional' },
  { value: '8', label: '8 - Nacional com conteúdo de importação > 70%' },
];

const UNIDADE_MEDIDA_OPTIONS = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'G', label: 'G - Grama' },
  { value: 'MT', label: 'MT - Metro' },
  { value: 'M2', label: 'M² - Metro Quadrado' },
  { value: 'M3', label: 'M³ - Metro Cúbico' },
  { value: 'LT', label: 'LT - Litro' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'DZ', label: 'DZ - Dúzia' },
  { value: 'PAR', label: 'PAR - Par' },
  { value: 'KIT', label: 'KIT - Kit' },
];

export default function NovoProductPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    categoryId: '',
    brandId: '',
    weight: '',
    width: '',
    height: '',
    depth: '',
    gtin: '',
    ncm: '',
    cest: '',
    origem: '0',
    unidadeMedida: 'UN',
    warrantyMonths: '',
    warrantyTerms: '',
    initialStock: '',
    minStock: '5',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
    isDigital: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get<Category[]>('/categories', { token: token || undefined }),
          api.get<Brand[]>('/brands', { token: token || undefined }),
        ]);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    if (token) fetchData();
  }, [token]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Nome do produto é obrigatório', variant: 'destructive' });
      return false;
    }
    if (!formData.sku.trim()) {
      toast({ title: 'SKU é obrigatório', variant: 'destructive' });
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({ title: 'Preço de venda é obrigatório', variant: 'destructive' });
      return false;
    }
    if (!formData.categoryId) {
      toast({ title: 'Categoria é obrigatória', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug || generateSlug(formData.name),
        shortDescription: formData.shortDescription || null,
        description: formData.description || null,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        depth: formData.depth ? parseFloat(formData.depth) : null,
        gtin: formData.gtin || null,
        ncm: formData.ncm || null,
        cest: formData.cest || null,
        origem: parseInt(formData.origem),
        unidadeMedida: formData.unidadeMedida,
        warrantyMonths: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
        warrantyTerms: formData.warrantyTerms || null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isDigital: formData.isDigital,
        images: imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
          isMain: index === 0,
        })),
        initialStock: formData.initialStock ? parseInt(formData.initialStock) : 0,
        minStock: parseInt(formData.minStock) || 5,
      };

      await api.post('/products', productData, { token: token || undefined });
      
      toast({ title: 'Produto criado com sucesso!' });
      router.push('/admin/produtos');
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast({ 
        title: 'Erro ao criar produto', 
        description: error.message || 'Tente novamente',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/produtos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
          <p className="text-muted-foreground">Cadastre um novo produto na loja</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Ex: Mesa de Som Digital X32"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Código) *</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Ex: X32-BEHRINGER"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL amigável (slug)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="mesa-de-som-digital-x32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gerado automaticamente a partir do nome
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descrição Curta</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Breve descrição do produto (aparece nas listagens)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descrição detalhada do produto com especificações técnicas"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preços */}
            <Card>
              <CardHeader>
                <CardTitle>Preços</CardTitle>
                <CardDescription>Defina os preços e calcule sua margem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço de Venda (R$) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Preço Comparativo (R$)</Label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.comparePrice}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                    <p className="text-xs text-muted-foreground">Preço "De:" para promoções</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                    <p className="text-xs text-muted-foreground">Uso interno</p>
                  </div>
                </div>

                {formData.price && formData.costPrice && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Margem de Lucro:</strong>{' '}
                      {(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%
                      {' | '}
                      <strong>Lucro:</strong> R${' '}
                      {(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dimensões e Peso */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensões e Peso</CardTitle>
                <CardDescription>Para cálculo de frete (Correios e transportadoras)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="0,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Largura (cm)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.width}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth">Profundidade (cm)</Label>
                    <Input
                      id="depth"
                      name="depth"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.depth}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Fiscais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Fiscais (NFe)</CardTitle>
                <CardDescription>
                  Informações obrigatórias para emissão de Nota Fiscal Eletrônica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gtin">GTIN/EAN (Código de Barras)</Label>
                    <Input
                      id="gtin"
                      name="gtin"
                      value={formData.gtin}
                      onChange={handleChange}
                      placeholder="7891234567890"
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground">
                      Código de barras de 8, 12, 13 ou 14 dígitos
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      name="ncm"
                      value={formData.ncm}
                      onChange={handleChange}
                      placeholder="85182100"
                      maxLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nomenclatura Comum do Mercosul (8 dígitos)
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cest">CEST</Label>
                    <Input
                      id="cest"
                      name="cest"
                      value={formData.cest}
                      onChange={handleChange}
                      placeholder="2100100"
                      maxLength={7}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se sujeito à Substituição Tributária
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origem">Origem do Produto</Label>
                    <Select
                      id="origem"
                      name="origem"
                      value={formData.origem}
                      onChange={handleChange}
                    >
                      {ORIGEM_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                    <Select
                      id="unidadeMedida"
                      name="unidadeMedida"
                      value={formData.unidadeMedida}
                      onChange={handleChange}
                    >
                      {UNIDADE_MEDIDA_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantia */}
            <Card>
              <CardHeader>
                <CardTitle>Garantia</CardTitle>
                <CardDescription>
                  Informações de garantia conforme Código de Defesa do Consumidor (CDC)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyMonths">Período de Garantia (meses)</Label>
                    <Input
                      id="warrantyMonths"
                      name="warrantyMonths"
                      type="number"
                      min="0"
                      value={formData.warrantyMonths}
                      onChange={handleChange}
                      placeholder="12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Garantia do fabricante + loja (mín. legal: 90 dias)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyTerms">Termos da Garantia</Label>
                  <Textarea
                    id="warrantyTerms"
                    name="warrantyTerms"
                    value={formData.warrantyTerms}
                    onChange={handleChange}
                    placeholder="Descreva as condições de garantia, o que está coberto e exclusões..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Otimização para mecanismos de busca (Google)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título SEO</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Título que aparece no Google (max 60 caracteres)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Descrição SEO</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Descrição que aparece no Google (max 160 caracteres)"
                    maxLength={160}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Produto Ativo</Label>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Produto em Destaque</Label>
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isDigital">Produto Digital</Label>
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={formData.isDigital}
                    onChange={(e) => handleCheckboxChange('isDigital', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Organização */}
            <Card>
              <CardHeader>
                <CardTitle>Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria *</Label>
                  <Select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandId">Marca</Label>
                  <Select
                    id="brandId"
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                  >
                    <option value="">Selecione uma marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Estoque */}
            <Card>
              <CardHeader>
                <CardTitle>Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialStock">Estoque Inicial</Label>
                  <Input
                    id="initialStock"
                    name="initialStock"
                    type="number"
                    min="0"
                    value={formData.initialStock}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Estoque Mínimo (alerta)</Label>
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={handleChange}
                    placeholder="5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
                <CardDescription>A primeira imagem será a principal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL da imagem"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addImage}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <img
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <span className="flex-1 text-sm truncate">{url}</span>
                        {index === 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href="/admin/produtos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Produto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
