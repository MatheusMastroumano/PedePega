'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Package, Users, ShoppingCart, AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AdminPage() {
  const { isAuthenticated, isAdmin, loading, adminFetch, authenticatedFetch, logout } = useAuth();
  const [pedidosAtivos, setPedidosAtivos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('pedidos'); // 'pedidos' ou 'produtos'
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
      carregarProdutos();
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

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true);
      
      const response = await authenticatedFetch('http://localhost:3001/api/produtos');
      
      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      } else {
        throw new Error('Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoadingProdutos(false);
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

  const deletarProduto = async (produtoId) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`http://localhost:3001/api/produtos/${produtoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await carregarProdutos();
        alert('Produto deletado com sucesso!');
      } else {
        throw new Error('Erro ao deletar produto');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading || (loadingData && loadingProdutos)) {
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
                <p className="text-2xl font-bold text-gray-900">{produtos.length}</p>
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

        {/* Navegação entre seções */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveSection('pedidos')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeSection === 'pedidos'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="inline mr-2" size={20} />
              Pedidos Ativos
            </button>
            <button
              onClick={() => setActiveSection('produtos')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeSection === 'produtos'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
              }`}
            >
              <Package className="inline mr-2" size={20} />
              Produtos
            </button>
          </div>
        </div>

        {/* Seção de Pedidos */}
        {activeSection === 'pedidos' && (
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
                          pedido.status === 'pen