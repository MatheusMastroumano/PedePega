"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  AlertTriangle
} from 'lucide-react';

export default function ClientePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, authenticatedFetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/FormLoginRegister');
      return;
    }
    carregarPedidos();
  }, [isAuthenticated]);

  const carregarPedidos = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:3001/api/pedidos');
      
      if (response.ok) {
        const data = await response.json();
        // Ordenar pedidos por data mais recente primeiro
        const pedidosOrdenados = (data.pedidos || data || []).sort((a, b) => {
          const dataA = new Date(a.data_pedido || a.createdAt || a.created_at);
          const dataB = new Date(b.data_pedido || b.createdAt || b.created_at);
          return dataB - dataA;
        });
        setPedidos(pedidosOrdenados);
      } else {
        const errorData = await response.json();
        setError(errorData.mensagem || 'Erro ao carregar pedidos');
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const cancelarPedido = async (pedidoId) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    try {
      const response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/cancelar`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        alert('Pedido cancelado com sucesso!');
        carregarPedidos();
      } else {
        const data = await response.json();
        alert(data.mensagem || 'Erro ao cancelar pedido');
      }
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      alert('Erro ao cancelar pedido');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'preparando':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'pronto':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'finalizado':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'preparando':
        return 'Em Preparação';
      case 'pronto':
        return 'Pronto para Retirada';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
          <strong className="block mb-2">Acesso negado!</strong>
          <p>Você precisa estar logado para ver seus pedidos.</p>
          <button
            onClick={() => router.push('/FormLoginRegister')}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-yellow-500" />
            Meus Pedidos
          </h1>
          <p className="text-gray-600 mt-2">Acompanhe o status dos seus pedidos</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl text-gray-500 mb-4">Nenhum pedido encontrado</h2>
              <p className="text-gray-400 mb-6">Você ainda não fez nenhum pedido.</p>
              <button
                onClick={() => router.push('/PaginaProdutos')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Fazer Primeiro Pedido
              </button>
            </div>
          ) : (
            pedidos.map((pedido, index) => (
              <div key={`pedido-${pedido.id}-${index}-${pedido.status}`} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  {/* Informações do Pedido */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(pedido.status)}
                      <span className="font-semibold text-lg text-gray-800">
                        Pedido #{pedido.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'preparando' ? 'bg-blue-100 text-blue-800' :
                        pedido.status === 'pronto' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                        pedido.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(pedido.status)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600 space-y-1">
                      <p>Data: {formatDate(pedido.data_pedido || pedido.createdAt || pedido.created_at)}</p>
                      <p className="font-semibold text-lg text-gray-800">
                        Total: {formatPrice(pedido.valor_total || pedido.total)}
                      </p>
                    </div>
                  </div>

                  {/* Botão de Cancelar */}
                  {pedido.status === 'pendente' && (
                    <button
                      key={`btn-cancelar-${pedido.id}-${index}`}
                      onClick={() => cancelarPedido(pedido.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Informação adicional baseada no status */}
                {pedido.status === 'pronto' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">
                      🎉 Seu pedido está pronto para retirada!
                    </p>
                  </div>
                )}
                
                {pedido.status === 'preparando' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800">
                      👨‍🍳 Seu pedido está sendo preparado...
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}