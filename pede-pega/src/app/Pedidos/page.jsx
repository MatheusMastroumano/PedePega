'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContexto/ContextoAuth';
import { useRouter } from 'next/navigation';
import { Package, User, Clock, DollarSign, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AdminPedidosPage = () => {
  const { isAuthenticated, isAdmin, authenticatedFetch, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  // Verificar permissões
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/FormLoginRegister');
        return;
      }
      
      if (!isAdmin()) {
        router.push('/PaginaCart');
        alert('Acesso negado! Apenas administradores podem acessar esta página.');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Carregar pedidos
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      carregarPedidos();
    }
  }, [isAuthenticated, isAdmin]);

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('http://localhost:3001/admin/pedidos');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos');
      }
      
      const data = await response.json();
      setPedidos(data.pedidos || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      alert('Erro ao carregar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPedido = async (pedidoId, novoStatus) => {
    setAtualizandoStatus(true);
    try {
      const response = await authenticatedFetch(`http://localhost:3001/admin/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: novoStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Recarregar pedidos
      await carregarPedidos();
      
      // Atualizar pedido selecionado se existir
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoId) {
        const pedidoAtualizado = pedidos.find(p => p.id === pedidoId);
        if (pedidoAtualizado) {
          setPedidoSelecionado({ ...pedidoAtualizado, status: novoStatus });
        }
      }

      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparando':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
      case 'confirmado':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparando':
        return <Package className="w-4 h-4" />;
      case 'pronto':
        return <AlertCircle className="w-4 h-4" />;
      case 'entregue':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = pedidos;

    // Filtro por status
    if (filtro !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.status?.toLowerCase() === filtro.toLowerCase()
      );
    }

    // Filtro por busca
    if (busca.trim()) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.id.toString().includes(busca) ||
        pedido.usuario_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        pedido.usuario_email?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    return pedidosFiltrados;
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

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo - Pedidos
          </h1>
          <p className="text-gray-600">
            Gerencie todos os pedidos dos clientes
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="preparando">Preparando</option>
                <option value="pronto">Pronto</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Pedido
              </label>
              <input
                type="text"
                placeholder="ID do pedido, nome ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {pedidos.filter(p => p.status?.toLowerCase() === 'pendente').length}
              </div>
              <div className="text-sm text-yellow-800">Pendentes</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {pedidos.filter(p => p.status?.toLowerCase() === 'preparando').length}
              </div>
              <div className="text-sm text-blue-800">Preparando</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {pedidos.filter(p => p.status?.toLowerCase() === 'pronto').length}
              </div>
              <div className="text-sm text-green-800">Prontos</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {pedidos.length}
              </div>
              <div className="text-sm text-gray-800">Total</div>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedidos ({pedidosFiltrados.length})
            </h2>
          </div>

          {pedidosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{pedido.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {pedido.usuario_nome}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatarData(pedido.data_pedido)}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            R$ {pedido.total?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(pedido.status)}`}>
                        {getStatusIcon(pedido.status)}
                        <span className="ml-1 capitalize">{pedido.status}</span>
                      </span>

                      {/* Botão Ver Detalhes */}
                      <button
                        onClick={() => setPedidoSelecionado(pedido)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>

                  {/* Ações rápidas de status */}
                  <div className="flex flex-wrap gap-2">
                    {pedido.status?.toLowerCase() === 'pendente' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'confirmado')}
                        disabled={atualizandoStatus}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                    )}
                    {pedido.status?.toLowerCase() === 'confirmado' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'preparando')}
                        disabled={atualizandoStatus}
                        className="px-3 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                      >
                        Iniciar Preparo
                      </button>
                    )}
                    {pedido.status?.toLowerCase() === 'preparando' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'pronto')}
                        disabled={atualizandoStatus}
                        className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                      >
                        Marcar como Pronto
                      </button>
                    )}
                    {pedido.status?.toLowerCase() === 'pronto' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'entregue')}
                        disabled={atualizandoStatus}
                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
                      >
                        Marcar como Entregue
                      </button>
                    )}
                    {pedido.status?.toLowerCase() !== 'cancelado' && pedido.status?.toLowerCase() !== 'entregue' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'cancelado')}
                        disabled={atualizandoStatus}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Pedido */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalhes do Pedido #{pedidoSelecionado.id}
                </h2>
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Nome:</span> {pedidoSelecionado.usuario_nome}</p>
                  <p><span className="font-medium">Email:</span> {pedidoSelecionado.usuario_email}</p>
                  <p><span className="font-medium">Data do Pedido:</span> {formatarData(pedidoSelecionado.data_pedido)}</p>
                </div>
              </div>

              {/* Status do Pedido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(pedidoSelecionado.status)}`}>
                    {getStatusIcon(pedidoSelecionado.status)}
                    <span className="ml-2 capitalize">{pedidoSelecionado.status}</span>
                  </span>
                  
                  <select
                    value={pedidoSelecionado.status}
                    onChange={(e) => atualizarStatusPedido(pedidoSelecionado.id, e.target.value)}
                    disabled={atualizandoStatus}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="pronto">Pronto</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {pedidoSelecionado.itens?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">R$ {item.preco.toFixed(2)} cada</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 italic">Detalhes dos itens não disponíveis</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>R$ {pedidoSelecionado.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Informações de Pagamento */}
              {pedidoSelecionado.forma_pagamento && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pagamento</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><span className="font-medium">Forma de Pagamento:</span> {pedidoSelecionado.forma_pagamento}</p>
                    {pedidoSelecionado.status_pagamento && (
                      <p><span className="font-medium">Status do Pagamento:</span> {pedidoSelecionado.status_pagamento}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPedidosPage;