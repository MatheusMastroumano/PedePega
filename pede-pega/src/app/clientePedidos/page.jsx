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
  AlertTriangle,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';

export default function clientePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosAtivos, setPedidosAtivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ativos');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  
  const { token, authenticatedFetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      carregarPedidos();
      carregarPedidosAtivos();
    }
  }, [token]);

  const carregarPedidos = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:3001/api/pedidos');
      const data = await response.json();
      
      if (response.ok) {
        setPedidos(data.pedidos || []);
      } else {
        setError(data.mensagem || 'Erro ao carregar pedidos');
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const carregarPedidosAtivos = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:3001/api/pedidos/ativos');
      const data = await response.json();
      
      if (response.ok) {
        setPedidosAtivos(data.pedidos || []);
      } else {
        console.error('Erro ao carregar pedidos ativos:', data.mensagem);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos ativos:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarItensPedido = async (pedidoId) => {
    setLoadingItens(true);
    try {
      const response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/itens`);
      const data = await response.json();
      
      if (response.ok) {
        setItensPedido(data.itens || []);
      } else {
        setError(data.mensagem || 'Erro ao carregar itens do pedido');
      }
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
      setError('Erro ao carregar itens do pedido');
    } finally {
      setLoadingItens(false);
    }
  };

  const cancelarPedido = async (pedidoId) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    try {
      const response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/cancelar`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Pedido cancelado com sucesso!');
        carregarPedidos();
        carregarPedidosAtivos();
      } else {
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
      case 'em_preparacao':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'pronto':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'entregue':
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
      case 'em_preparacao':
        return 'Em Preparação';
      case 'pronto':
        return 'Pronto para Retirada';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const visualizarDetalhes = (pedido) => {
    setSelectedPedido(pedido);
    carregarItensPedido(pedido.id);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
          <strong className="block mb-2">Acesso negado!</strong>
          <p>Você precisa estar logado para ver seus pedidos.</p>
          <button
            onClick={() => router.push('/FormLoginRegister')}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-yellow-500" />
            Meus Pedidos
          </h1>
          <p className="text-gray-600 mt-2">Acompanhe o status dos seus pedidos</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ativos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'ativos'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pedidos Ativos ({pedidosAtivos.length})
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'todos'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todos os Pedidos ({pedidos.length})
              </button>
            </nav>
          </div>
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
          {(activeTab === 'ativos' ? pedidosAtivos : pedidos).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl text-gray-500 mb-4">
                {activeTab === 'ativos' ? 'Nenhum pedido ativo' : 'Nenhum pedido encontrado'}
              </h2>
              <p className="text-gray-400 mb-6">
                {activeTab === 'ativos' 
                  ? 'Você não possui pedidos em andamento no momento.' 
                  : 'Você ainda não fez nenhum pedido.'
                }
              </p>
              <button
                onClick={() => router.push('/PaginaProdutos')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Fazer Primeiro Pedido
              </button>
            </div>
          ) : (
            (activeTab === 'ativos' ? pedidosAtivos : pedidos).map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informações do Pedido */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(pedido.status)}
                      <span className="font-semibold text-lg text-gray-800">
                        Pedido #{pedido.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'em_preparacao' ? 'bg-blue-100 text-blue-800' :
                        pedido.status === 'pronto' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(pedido.status)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Pedido feito em: {formatDate(pedido.data_pedido)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Retirada no local</span>
                      </div>
                      <div className="font-semibold text-lg text-gray-800 mt-2">
                        Total: R$ {parseFloat(pedido.valor_total || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => visualizarDetalhes(pedido)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </button>
                    
                    {pedido.status === 'pendente' && (
                      <button
                        onClick={() => cancelarPedido(pedido.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedPedido && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Detalhes do Pedido #{selectedPedido.id}
                  </h2>
                  <button
                    onClick={() => setSelectedPedido(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedPedido.status)}
                  <span className="text-lg font-semibold">
                    Status: {getStatusText(selectedPedido.status)}
                  </span>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Data do Pedido:</strong>
                    <p>{formatDate(selectedPedido.data_pedido)}</p>
                  </div>
                  <div>
                    <strong>Valor Total:</strong>
                    <p className="text-lg font-bold text-yellow-600">
                      R$ {parseFloat(selectedPedido.valor_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Itens */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Itens do Pedido</h3>
                  {loadingItens ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itensPedido.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            {item.imagem && (
                              <img
                                src={item.imagem}
                                alt={item.nome}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold">{item.nome}</h4>
                              <p className="text-gray-600">R$ {parseFloat(item.preco || 0).toFixed(2)} cada</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Qtd: {item.quantidade}</p>
                            <p className="text-lg font-bold">
                              R$ {(parseFloat(item.preco || 0) * parseInt(item.quantidade || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}