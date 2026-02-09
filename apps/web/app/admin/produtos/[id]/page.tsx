'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ImagePlus, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
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

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isMain: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  categoryId: string;
  brandId?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  gtin?: string;
  ncm?: string;
  cest?: string;
  origem: number;
  unidadeMedida: string;
  warrantyMonths?: number;
  warrantyTerms?: string;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images: ProductImage[];
  inventory?: { quantity: number; minQuantity: number };
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const token = useAuthStore((state) => state.token);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
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
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
    isDigital: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, categoriesRes, brandsRes] = await Promise.all([
          api.get<Product>(`/products/id/${productId}`, { token: token || undefined }),
          api.get<Category[]>('/categories', { token: token || undefined }),
          api.get<Brand[]>('/brands', { token: token || undefined }),
        ]);

        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setBrands(Array.isArray(brandsRes) ? brandsRes : []);
        setExistingImages(product.images || []);

        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          slug: product.slug || '',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          comparePrice: product.comparePrice?.toString() || '',
          costPrice: product.costPrice?.toString() || '',
          categoryId: product.categoryId || '',
          brandId: product.brandId || '',
          weight: product.weight?.toString() || '',
          width: product.width?.toString() || '',
          height: product.height?.toString() || '',
          depth: product.depth?.toString() || '',
          gtin: product.gtin || '',
          ncm: product.ncm || '',
          cest: product.cest || '',
          origem: product.origem?.toString() || '0',
          unidadeMedida: product.unidadeMedida || 'UN',
          warrantyMonths: product.warrantyMonths?.toString() || '',
          warrantyTerms: product.warrantyTerms || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          isDigital: product.isDigital ?? false,
        });
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({ title: 'Erro ao carregar produto', variant: 'destructive' });
        router.push('/admin/produtos');
      } finally {
        setLoading(false);
      }
    };

    if (token && productId) fetchData();
  }, [token, productId, router]);

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

  const addImage = async () => {
    if (!newImageUrl.trim()) return;
    
    try {
      await api.post(`/products/${productId}/images`, 
        { images: [{ url: newImageUrl.trim() }] },
        { token: token || undefined }
      );
      
      const product = await api.get<Product>(`/products/id/${productId}`, { token: token || undefined });
      setExistingImages(product.images || []);
      setNewImageUrl('');
      toast({ title: 'Imagem adicionada!' });
    } catch (error) {
      toast({ title: 'Erro ao adicionar imagem', variant: 'destructive' });
    }
  };

  const removeImage = async (imageId: string) => {
    if (!confirm('Remover esta imagem?')) return;
    
    try {
      await api.delete(`/products/${productId}/images/${imageId}`, { token: token || undefined });
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: 'Imagem removida!' });
    } catch (error) {
      toast({ title: 'Erro ao remover imagem', variant: 'destructive' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Nome do produto é obrigatório', variant: 'destructive' });
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

    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
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
      };

      await api.patch(`/products/${productId}`, productData, { token: token || undefined });
      
      toast({ title: 'Produto atualizado com sucesso!' });
      router.push('/admin/produtos');
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast({ 
        title: 'Erro ao atualizar produto', 
        description: error.message || 'Tente novamente',
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;

    try {
      await api.delete(`/products/${productId}`, { token: token || undefined });
      toast({ title: 'Produto excluído com sucesso!' });
      router.push('/admin/produtos');
    } catch (error) {
      toast({ title: 'Erro ao excluir produto', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/produtos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Editar Produto</h1>
            <p className="text-muted-foreground">SKU: {formData.sku}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
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
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Código)</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">SKU não pode ser alterado</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL amigável (slug)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descrição Curta</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
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
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preços */}
            <Card>
              <CardHeader>
                <CardTitle>Preços</CardTitle>
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
                    />
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
                    />
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
              </CardHeader>
              <CardContent>
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Fiscais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Fiscais (NFe)</CardTitle>
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
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      name="ncm"
                      value={formData.ncm}
                      onChange={handleChange}
                      maxLength={8}
                    />
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
                      maxLength={7}
                    />
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyTerms">Termos da Garantia</Label>
                  <Textarea
                    id="warrantyTerms"
                    name="warrantyTerms"
                    value={formData.warrantyTerms}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título SEO</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
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

                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    {existingImages.map((img, index) => (
                      <div key={img.id} className="flex items-center gap-2 p-2 border rounded">
                        <img
                          src={img.url}
                          alt={img.alt || `Imagem ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <span className="flex-1 text-sm truncate">{img.url}</span>
                        {img.isMain && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {existingImages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma imagem adicionada
                  </p>
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
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
