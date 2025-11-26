import { useEffect, useState } from 'react';
import { Heart, Share2, MessageCircle, Package, HelpCircle, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Filter from "./Filter";

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
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [helpData, setHelpData] = useState<HelpRequest>({
    name: '',
    email: '',
    message: '',
  });

  // load products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error) {
        setProducts(data);
        setFilteredProducts(data);
      }
    };

    fetchProducts();
  }, []);

  // filter by category
  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter((p) => p.category === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const generateShareLink = (product: MarketplaceProduct) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?product=${product.id}`;
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const contactCompany = (product: MarketplaceProduct) => {
    const text = `Hola, me interesa el producto: ${product.name}. Precio: ${product.currency} ${product.price.toFixed(2)}`;
    window.open(
      `https://wa.me/${product.company_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
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
    <div>
      {/* FILTRO */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter onSelectCategory={(id) => setSelectedCategory(id)} />
          <h2 className="text-lg font-semibold text-gray-900">Filtrar por Categoría</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ver Todo
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GRID PRODUCTOS */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin productos en esta categoría</h3>
          <p className="text-gray-600">Intenta seleccionar otra categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* CARD… */}
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE AYUDA */}
      {showHelpModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* modal */}
        </div>
      )}
    </div>
  );
}
