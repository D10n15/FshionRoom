import { useEffect, useState } from 'react';
import { Heart, Share2, MessageCircle, Package, HelpCircle, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
  stock: number;
  company_name: string;
  company_nit: string;
  company_email: string;
  company_whatsapp: string;
  category: string;
}

const CATEGORIES = [
  { id: 'camisas', name: 'Camisas', icon: '👕' },
  { id: 'pantalones', name: 'Pantalones', icon: '👖' },
  { id: 'zapatos', name: 'Zapatos', icon: '👞' },
  { id: 'gorras', name: 'Gorras', icon: '🧢' },
  { id: 'reloj', name: 'Reloj', icon: '⏰' },
  { id: 'anillos', name: 'Anillos', icon: '💍' },
  { id: 'pulseras', name: 'Pulseras', icon: '⌚' },
  { id: 'otro', name: 'Otro', icon: '📦' },
];


interface HelpRequest {
  name: string;
  email: string;
  message: string;
}

export default function ProductsMarketplace() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showShareLink, setShowShareLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [helpData, setHelpData] = useState<HelpRequest>({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(p => p.category_id === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          image_url,
          price,
          currency,
          stock,
          company_name,
          company_nit,
          company_email,
          company_whatsapp,
          category
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = (product: MarketplaceProduct) => {
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}?product=${product.id}`;
    return shareLink;
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const contactCompany = (product: MarketplaceProduct) => {
    if (product.company_whatsapp) {
      const text = `Hola, me interesa el producto: ${product.name}. Precio: ${product.currency} ${product.price.toFixed(2)}`;
      window.open(`https://wa.me/${product.company_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      alert(`Gracias por tu mensaje. Nos contactaremos en breve a: ${helpData.email}`);
      setHelpData({ name: '', email: '', message: '' });
      setShowHelpModal(false);
    } catch (error) {
      console.error('Error sending help request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tienda de Moda en Línea</h1>
          <p className="text-xl text-gray-600">Descubre los mejores productos de nuestros vendedores</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Filtrar por Categoría</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ver Todo
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin productos en esta categoría</h3>
            <p className="text-gray-600">Intenta seleccionar otra categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                    Stock: {product.stock}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {product.currency === 'EUR' ? '€' : product.currency === 'USD' ? '$' : '$'}
                      {product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Información de la Empresa</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 font-bold">{product.company_name}</p>
                      {product.company_nit && (
                        <p className="text-gray-600">
                          <span className="font-medium">NIT:</span> {product.company_nit}
                        </p>
                      )}
                      {product.company_email && (
                        <p className="text-gray-600 break-all">
                          <span className="font-medium">Email:</span> {product.company_email}
                        </p>
                      )}
                      {product.company_whatsapp && (
                        <p className="text-gray-600">
                          <span className="font-medium">WhatsApp:</span> {product.company_whatsapp}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={() => setShowShareLink(showShareLink === product.id ? null : product.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Compartir</span>
                    </button>
                    <button
                      onClick={() => contactCompany(product)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200 font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Contactar</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowHelpModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 font-medium"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm">Ayuda</span>
                    </button>
                  </div>

                  {showShareLink === product.id && (
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Enlace para compartir:</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={generateShareLink(product)}
                          className="flex-1 text-xs px-2 py-1 bg-white border border-gray-300 rounded text-gray-600"
                        />
                        <button
                          onClick={() => copyToClipboard(generateShareLink(product))}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          {copiedLink ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showHelpModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Ayuda</h2>
            <p className="text-gray-600 mb-6">Sobre: <span className="font-semibold">{selectedProduct.name}</span></p>

            <form onSubmit={handleHelpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu Nombre</label>
                <input
                  type="text"
                  value={helpData.name}
                  onChange={(e) => setHelpData({ ...helpData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu Email</label>
                <input
                  type="email"
                  value={helpData.email}
                  onChange={(e) => setHelpData({ ...helpData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  value={helpData.message}
                  onChange={(e) => setHelpData({ ...helpData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
