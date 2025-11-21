
import { 
  Store, 
  ShoppingCart, 
  BarChart3, 
  Cable, 
  LogOut, 
  Sparkles, 
  ShoppingBag,
  Package 
} from 'lucide-react';

import { supabase } from '../lib/supabase';

type NavbarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  storeName: string;
};

export default function Navbar({ activeTab, setActiveTab, storeName }: NavbarProps) {

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // No recargamos: App.tsx detecta el logout automáticamente
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Utilidad para aplicar clases al botón activo
  const tabClass = (tab: string) => 
    `px-4 py-2 rounded-lg font-medium transition-colors 
     ${activeTab === tab 
      ? 'bg-blue-50 text-blue-700 font-semibold' 
      : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Izquierda */}
          <div className="flex items-center space-x-8">
            
            {/* Logo + nombre */}
            <div className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                {storeName || 'Mi Tienda'}
              </span>
            </div>

            {/* Tabs */}
            <div className="hidden md:flex space-x-1">

              <button onClick={() => setActiveTab('dashboard')} className={tabClass('dashboard')}>
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Dashboard
              </button>

              <button onClick={() => setActiveTab('products')} className={tabClass('products')}>
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Productos
              </button>

              <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}>
                <Package className="w-5 h-5 inline mr-2" />
                Pedidos
              </button>

              <button onClick={() => setActiveTab('integrations')} className={tabClass('integrations')}>
                <Cable className="w-5 h-5 inline mr-2" />
                Integraciones
              </button>

              <button onClick={() => setActiveTab('feed')} className={tabClass('feed')}>
                <Sparkles className="w-5 h-5 inline mr-2" />
                Feed
              </button>

              <button onClick={() => setActiveTab('marketplace')} className={tabClass('marketplace')}>
                <ShoppingBag className="w-5 h-5 inline mr-2" />
                Tienda
              </button>

            </div>
          </div>

          {/* Derecha */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 
                         hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
