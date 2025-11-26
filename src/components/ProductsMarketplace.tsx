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
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [helpData, setHelpData] = useState<HelpRequest>({
    name: "",
    email: "",
    message: "",
  });

  // Load products from supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProducts(data);
        setFilteredProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Category filtering
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
    const text = `Hola, me interesa el producto: ${product.name}. Precio: ${product.currency} ${product.price.toFixed(
      2
    )}`;

    window.open(
      `https://wa.me/${product.company_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank"
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
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin productos</h3>
          <p className="text-gray-600">Intenta seleccionar otra categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>

              <div className="mt-3 font-semibold text-blue-600 text-lg">
                {product.currency} {product.price}
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => contactCompany(product)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Contactar
                </button>

                <button
                  onClick={() => setShowShareLink(generateShareLink(product))}
                  className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Share2 className="w-5 h-5 mr-2" /> Compartir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
