'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContexto/ContextoAuth';
import { useRouter } from 'next/navigation';
import { Package, Clock, DollarSign, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const PedidosPage = () => {
  const { isAuthenticated, authenticatedFetch, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/FormLoginRegister');
    }
  }, [isAuthenticated, authLoading, router]);

  // Carregar pedidos
  useEffect(() => {
    if (isAuthenticated) {
      carregarPedidos();
    }
  }, [isAuthenticated]);

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('http://localhost:3001/api/pedido');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos');
      }
      
      const data = await response.json();
      setPedidos(data.pedidos || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setError('Erro ao carregar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em preparo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pronto':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'entregue':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'em preparo':
        return <Package className="w-4 h-4" />;
      case 'pronto':
        return <CheckCircle className="w-4 h-4" />;
      case 'entregue':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Pedidos
          </h1>
          <p className="text-gray-600">
            Acompanhe o status dos seus pedidos
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Você ainda não fez nenhum pedido</p>
              <button
                onClick={() => router.push('/PaginaProdutos')}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Ver Produtos
              </button>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <div
                key={pedido.id_pedido}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{pedido.numero_pedido}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatarData(pedido.data)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(pedido.status)}`}>
                    {getStatusIcon(pedido.status)}
                    {pedido.status}
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Itens do Pedido:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm">
                      {pedido.itens_pedido ? (
                        pedido.itens_pedido.split(', ').map((item, index) => (
                          <span key={index} className="block mb-1">
                            {item}
                          </span>
                        ))
                      ) : (
                        'Nenhum item encontrado'
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        Total: R$ {pedido.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;