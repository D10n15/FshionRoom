import { useEffect, useState } from 'react';
import { Plus, Cable, Facebook, Instagram, ShoppingBag, Globe, Zap, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Integration } from '../lib/supabase';

type IntegrationsProps = {
  storeId: string;
};

const platformIcons: Record<string, any> = {
  Facebook: Facebook,
  Instagram: Instagram,
  WooCommerce: ShoppingBag,
  Shopify: ShoppingBag,
  'Custom API': Globe,
  Zapier: Zap,
};

const availablePlatforms = [
  { name: 'Facebook', type: 'social_media', description: 'Conecta tu página de Facebook para publicar productos automáticamente' },
  { name: 'Instagram', type: 'social_media', description: 'Sincroniza tu catálogo con Instagram Shopping' },
  { name: 'WooCommerce', type: 'ecommerce', description: 'Importa y sincroniza productos con tu tienda WooCommerce' },
  { name: 'Shopify', type: 'ecommerce', description: 'Integración bidireccional con Shopify' },
  { name: 'Custom API', type: 'custom', description: 'Conecta cualquier API personalizada' },
  { name: 'Zapier', type: 'automation', description: 'Automatiza flujos de trabajo con miles de aplicaciones' },
];

export default function Integrations({ storeId }: IntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [formData, setFormData] = useState({
    api_key: '',
    webhook_url: '',
    sync_enabled: true,
  });

  useEffect(() => {
    loadIntegrations();
  }, [storeId]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('integrations').insert({
        store_id: storeId,
        platform_name: selectedPlatform.name,
        platform_type: selectedPlatform.type,
        api_key: formData.api_key,
        config: {
          webhook_url: formData.webhook_url,
          sync_enabled: formData.sync_enabled,
        },
        is_active: true,
      });

      if (error) throw error;

      setShowModal(false);
      setSelectedPlatform(null);
      setFormData({ api_key: '', webhook_url: '', sync_enabled: true });
      loadIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta integración?')) return;

    try {
      const { error } = await supabase.from('integrations').delete().eq('id', id);
      if (error) throw error;
      loadIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const handleSync = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadIntegrations();
    } catch (error) {
      console.error('Error syncing integration:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integraciones</h2>
          <p className="text-gray-600 mt-1">Conecta tu tienda con otras plataformas para potenciar tus ventas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integraciones Activas</h3>
          {integrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Cable className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay integraciones configuradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => {
                const Icon = platformIcons[integration.platform_name] || Cable;
                return (
                  <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${integration.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-6 h-6 ${integration.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.platform_name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{integration.platform_type.replace('_', ' ')}</p>
                          {integration.last_sync && (
                            <p className="text-xs text-gray-500 mt-1">
                              Última sincronización: {new Date(integration.last_sync).toLocaleString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSync(integration.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sincronizar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(integration.id, integration.is_active)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            integration.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {integration.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                        <button
                          onClick={() => handleDelete(integration.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plataformas Disponibles</h3>
          <div className="space-y-3">
            {availablePlatforms.map((platform) => {
              const Icon = platformIcons[platform.name] || Cable;
              const isConnected = integrations.some((i) => i.platform_name === platform.name);

              return (
                <div key={platform.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowModal(true);
                      }}
                      disabled={isConnected}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                        isConnected
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isConnected ? 'Conectado' : 'Conectar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Conectar {selectedPlatform.name}
            </h3>
            <p className="text-gray-600 mb-6">{selectedPlatform.description}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="text"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ingresa tu API key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (opcional)</label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://tu-webhook.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sync_enabled}
                  onChange={(e) => setFormData({ ...formData, sync_enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Habilitar sincronización automática</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPlatform(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
