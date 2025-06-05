// Exemplo de como criar uma página de admin usando o contexto
// Arquivo: pede-pega/src/app/admin/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Package, Users, ShoppingCart, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AdminPage() {
  const { isAuthenticated, isAdmin, loading, adminFetch, logout } = useAuth();
  const [pedidosAtivos, setPedidosAtivos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Verificar autenticação e privilégios
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/FormLoginRegister');
        return;
      }
      
      if (!isAdmin) {
        router.push('/PaginaProdutos');
        return;
      }
      
      // Carregar dados administrativos
      carregarPedidosAtivos();
    }
  }, [loading, isAuthenticated, isAdmin]);

  const carregarPedidosAtivos = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      const response = await adminFetch('http://localhost:3001/api/admin/pedidos/ativos');
      
      if (response.ok) {
        const data = await response.json();
        setPedidosAtivos(data);
      } else {
        throw new Error('Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos ativos:', error);
      setError('Erro ao carregar dados administrativos');
      
      // Se houver erro de autenticação, redirecionar
      if (error.message.includes('Token expirado') || error.message.includes('administrador')) {
        router.push('/FormLoginRegister');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const alterarStatusPedido = async (pedidoId, novoStatus) => {
    try {
      const response = await adminFetch(`http://localhost:3001/api/admin/pedidos/${pedidoId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        // Recarregar pedidos após alteração
        await carregarPedidosAtivos();
        alert('Status do pedido alterado com sucesso!');
      } else {
        throw new Error('Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do pedido');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="text-red-600 mr-3" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingCart className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Pedidos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{pedidosAtivos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Usuários Registrados</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos Ativos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pedidos Ativos</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosAtivos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{pedido.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido.usuario?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'preparando' ? 'bg-blue-100 text-blue-800' :
                        pedido.status === 'pronto' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {pedido.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(pedido.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {pedido.status === 'pendente' && (
                        <button
                          onClick={() => alterarStatusPedido(pedido.id, 'preparando')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Preparar
                        </button>
                      )}
                      {pedido.status === 'preparando' && (
                        <button
                          onClick={() => alterarStatusPedido(pedido.id, 'pronto')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Finalizar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pedidosAtivos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum pedido ativo encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}