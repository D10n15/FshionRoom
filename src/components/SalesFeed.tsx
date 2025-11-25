import { useEffect, useState } from 'react';
import { Heart, Share2, MessageCircle, Store, Sparkles, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';


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


interface FeedPost {
  id: string;
  product_id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  view_count: number;
  share_count: number;
  is_featured: boolean;
  created_at: string;
  stores: {
    name: string;
    logo_url: string;
  };
  products?: {
    company_name: string;
    company_nit: string;
    company_email: string;
    company_whatsapp: string;
    currency: string;
    category: string;
  };
}

type SalesFeedProps = {
  userId: string;
};

export default function SalesFeed({ userId }: SalesFeedProps) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    loadFeedPosts();
  }, [filter]);

  useEffect(() => {
    let filtered = feedPosts;

    if (filter === 'featured') {
      filtered = filtered.filter(p => p.is_featured);
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.products?.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [feedPosts, filter, selectedCategory]);

  const loadFeedPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sales_feed')
        .select(`
          id,
          product_id,
          title,
          description,
          image_url,
          price,
          view_count,
          share_count,
          is_featured,
          created_at,
          stores(name, logo_url),
          products(company_name, company_nit, company_email, company_whatsapp, currency, category)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'featured') {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFeedPosts(data || []);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareOnFacebook = (post: FeedPost) => {
    const url = window.location.href;
    const shareText = `¡Mira esta publicación en Fashion Room! 👗 ${post.title} - $${post.price.toFixed(2)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, 'facebook-share-dialog', 'width=800,height=600');
  };

  const updateViewCount = async (postId: string) => {
    try {
      const post = feedPosts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('sales_feed')
          .update({ view_count: post.view_count + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const updateShareCount = async (postId: string) => {
    try {
      const post = feedPosts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('sales_feed')
          .update({ share_count: post.share_count + 1 })
          .eq('id', postId);

        loadFeedPosts();
      }
    } catch (error) {
      console.error('Error updating share count:', error);
    }
  };

  const handleShareClick = (post: FeedPost) => {
    updateShareCount(post.id);
    shareOnFacebook(post);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feed de Ventas</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'featured'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Destacadas</span>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Filtrar por Categoría</h3>
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

      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'featured' ? 'Sin publicaciones destacadas' : 'Sin publicaciones en esta categoría'}
          </h3>
          <p className="text-gray-600">
            {filter === 'featured'
              ? 'Aún no hay publicaciones destacadas'
              : 'Intenta seleccionar otra categoría'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              onClick={() => updateViewCount(post.id)}
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.is_featured && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span>Destacado</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  {post.stores.logo_url && (
                    <img
                      src={post.stores.logo_url}
                      alt={post.stores.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {post.stores.name}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {post.products?.currency === 'EUR' ? '€' : post.products?.currency === 'USD' ? '$' : '$'}
                    {post.price.toFixed(2)}
                  </span>
                </div>

                {post.products && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Contacto de Empresa</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-900 font-bold">{post.products.company_name}</p>
                      {post.products.company_nit && (
                        <p className="text-gray-600">NIT: {post.products.company_nit}</p>
                      )}
                      {post.products.company_email && (
                        <p className="text-gray-600 break-all">{post.products.company_email}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center space-x-1">
                    <span>{post.view_count}</span>
                    <span>vistas</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>{post.share_count}</span>
                    <span>compartidas</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Me gusta</span>
                  </button>
                  <button
                    onClick={() => handleShareClick(post)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Compartir</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowHelpModal(true);
                    }}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 font-medium"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Ayuda</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showHelpModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Ayuda</h2>
            <p className="text-gray-600 mb-6">Sobre: <span className="font-semibold">{selectedPost.title}</span></p>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold text-blue-900">Puedes contactar directamente con la empresa:</p>
              {selectedPost.products?.company_whatsapp && (
                <button
                  onClick={() => {
                    const text = `Hola, me interesa el producto: ${selectedPost.title}`;
                    window.open(`https://wa.me/${selectedPost.products!.company_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                    setShowHelpModal(false);
                  }}
                  className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  Contactar por WhatsApp
                </button>
              )}
              {selectedPost.products?.company_email && (
                <a
                  href={`mailto:${selectedPost.products.company_email}?subject=Consulta sobre ${selectedPost.title}`}
                  className="mt-2 block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center"
                >
                  Enviar Email
                </a>
              )}
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
