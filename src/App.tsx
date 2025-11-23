import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Store } from './lib/supabase';
import Auth from './components/Auth';
import StoreSetup from './components/StoreSetup';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Integrations from './components/Integrations';
import SalesFeed from './components/SalesFeed';
import ProductsMarketplace from './components/ProductsMarketplace';

function App() {
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadStore();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await loadStore();
    }
    setLoading(false);
  };

  const loadStore = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)   // ← ESTO ESTÁ PERFECTO POR QUE IMPIDE QUE EL USUARIO NUEVO VEA LO DEL USUARIO ANTIGUO.
        .maybeSingle();
  
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
  
      setStore(data);
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (activeTab === 'marketplace') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} storeName={store?.name || 'Mi Tienda'} />
        <ProductsMarketplace />
      </div>
    );
  }

  if (!store) {
    return <StoreSetup onStoreCreated={loadStore} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} storeName={store.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard storeId={store.id} />}
        {activeTab === 'products' && <Products storeId={store.id} storeName={store.name} />}
        {activeTab === 'orders' && <Orders storeId={store.id} />}
        {activeTab === 'integrations' && <Integrations storeId={store.id} />}
        {activeTab === 'feed' && <SalesFeed userId={user.id} />}
      </main>
    </div>
  );
}

export default App;
