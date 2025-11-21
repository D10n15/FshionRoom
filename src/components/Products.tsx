import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Package, Upload, Link as LinkIcon, Image as ImageIcon, Share2, MessageCircle, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';

const EXCHANGE_RATES = {
  MXN: 1,
  USD: 0.059,
  EUR: 0.054,
};

const CURRENCIES = [
  { code: 'COP', symbol: '$', name: 'Pesos Colombianos' },
  { code: 'USD', symbol: '$', name: 'Dólares USD' },
  { code: 'EUR', symbol: '€', name: 'Euros' },
  { code: 'MXN', symbol: '€', name: 'Pesos Mexicanos' },
];

type ProductsProps = {
  storeId: string;
  storeName?: string;
};

export default function Products({ storeId, storeName = 'Mi Tienda' }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'drive' | 'device'>('url');
  const [selectedCurrency, setSelectedCurrency] = useState('MXN');
  const [newProductForShare, setNewProductForShare] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    is_active: true,
    currency: 'MXN',
    company_name: '',
    company_nit: '',
    company_email: '',
    company_whatsapp: '',
  });

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image_url: formData.image_url,
            is_active: formData.is_active,
            currency: formData.currency,
            company_name: formData.company_name,
            company_nit: formData.company_nit,
            company_email: formData.company_email,
            company_whatsapp: formData.company_whatsapp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert({
          store_id: storeId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          image_url: formData.image_url,
          is_active: formData.is_active,
          currency: formData.currency,
          company_name: formData.company_name,
          company_nit: formData.company_nit,
          company_email: formData.company_email,
          company_whatsapp: formData.company_whatsapp,
        }).select().single();

        if (error) throw error;

        setNewProductForShare(data);
        setShowShareModal(true);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '', image_url: '', is_active: true, currency: 'MXN', company_name: '', company_nit: '', company_email: '', company_whatsapp: '' });
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url,
      is_active: product.is_active,
      currency: product.currency || 'MXN',
      company_name: product.company_name || '',
      company_nit: product.company_nit || '',
      company_email: product.company_email || '',
      company_whatsapp: product.company_whatsapp || '',
    });
    setUploadMethod('url');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getConvertedPrice = (price: number, currency: string): number => {
    return price * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  };

  const shareOnWhatsApp = (product: Product | null) => {
    if (!product) return;
    const currencySymbol = CURRENCIES.find(c => c.code === product.currency)?.symbol || '$';
    const text = `¡Mira este producto en Fashion Room! 👗\n\n${product.name}\n${product.description}\n\nPrecio: ${currencySymbol}${product.price.toFixed(2)}\n\n¡Hazte con el tuyo ahora!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnFacebook = (product: Product | null) => {
    if (!product) return;
    const currencySymbol = CURRENCIES.find(c => c.code === product.currency)?.symbol || '$';
    const text = `¡Mira este producto en Fashion Room! 👗 ${product.name} - ${currencySymbol}${product.price.toFixed(2)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, 'facebook-share-dialog', 'width=800,height=600');
  };

  const shareOnInstagram = (product: Product | null) => {
    if (!product) return;
    const currencySymbol = CURRENCIES.find(c => c.code === product.currency)?.symbol || '$';
    const text = `¡Mira este producto en Fashion Room! 👗 ${product.name} ${currencySymbol}${product.price.toFixed(2)} #FashionRoom #Moda`;
    alert(`Copia este texto y pégalo en Instagram:\n\n${text}`);
    navigator.clipboard.writeText(text);
  };

  const shareOnTikTok = (product: Product | null) => {
    if (!product) return;
    const currencySymbol = CURRENCIES.find(c => c.code === product.currency)?.symbol || '$';
    const text = `¡Mira este producto! ${product.name} ${currencySymbol}${product.price.toFixed(2)} 👗 #FashionRoom #Moda #Compra`;
    alert(`Ve a TikTok y comparte este texto:\n\n${text}`);
    navigator.clipboard.writeText(text);
  };

  const addToFeed = async (product: Product | null) => {
    if (!product) return;
    try {
      const { error } = await supabase.from('sales_feed').insert({
        product_id: product.id,
        store_id: storeId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: product.name,
        description: product.description,
        image_url: product.image_url,
        price: product.price,
      });

      if (error) throw error;
      setShowShareModal(false);
      setNewProductForShare(null);
    } catch (error) {
      console.error('Error adding to feed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', stock: '', image_url: '', is_active: true });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer producto</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {!product.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Inactivo
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">${parseFloat(product.price.toString()).toFixed(2)}</span>
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Subir Imagen</label>

                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      uploadMethod === 'url'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Enlace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMethod('device')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      uploadMethod === 'device'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Galería</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMethod('drive')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      uploadMethod === 'drive'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Drive</span>
                  </button>
                </div>

                {uploadMethod === 'url' && (
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                {uploadMethod === 'device' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                )}

                {uploadMethod === 'drive' && (
                  <div>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enlace compartido de Google Drive"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pega el enlace compartido de tu archivo en Google Drive
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Empresa</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Mi Empresa de Moda"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIT/RUC</label>
                    <input
                      type="text"
                      value={formData.company_nit}
                      onChange={(e) => setFormData({ ...formData, company_nit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="123456789-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp de Empresa</label>
                    <input
                      type="tel"
                      value={formData.company_whatsapp}
                      onChange={(e) => setFormData({ ...formData, company_whatsapp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de Empresa</label>
                  <input
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="contacto@miempresa.com"
                  />
                </div>
              </div>

              <div className="flex items-center pt-4">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Producto activo</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal && newProductForShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Producto Creado!</h2>
            <p className="text-gray-600 mb-6">Comparte tu nuevo producto en redes sociales</p>

            <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
              {newProductForShare.image_url && (
                <img
                  src={newProductForShare.image_url}
                  alt={newProductForShare.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{newProductForShare.name}</h3>
                <p className="text-sm text-gray-600 truncate">{newProductForShare.description}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {CURRENCIES.find(c => c.code === newProductForShare.currency)?.symbol}
                  {newProductForShare.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => shareOnWhatsApp(newProductForShare)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => shareOnFacebook(newProductForShare)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Share2 className="w-5 h-5" />
                <span>Facebook</span>
              </button>

              <button
                onClick={() => shareOnInstagram(newProductForShare)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </button>

              <button
                onClick={() => shareOnTikTok(newProductForShare)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <span className="text-xl">♪</span>
                <span>TikTok</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => addToFeed(newProductForShare)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Agregar al Feed
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setNewProductForShare(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
