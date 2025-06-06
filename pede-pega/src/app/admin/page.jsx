'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShoppingCart, Package, Clock, Check, X, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AdminPage() {
    const { isAuthenticated, isAdmin, loading, authenticatedFetch, logout } = useAuth();
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !isAdmin) {
                router.push('/FormLoginRegister');
                return;
            }
            carregarPedidosAtivos();
        }
    }, [loading, isAuthenticated, isAdmin]);

    const carregarPedidosAtivos = async () => {
        try {
            setLoadingData(true);
            const response = await authenticatedFetch('http://localhost:3001/api/pedidos/ativos');
            
            if (response.ok) {
                const data = await response.json();
                setPedidosAtivos(data.pedidos || data || []);
            } else {
                throw new Error('Erro ao carregar pedidos');
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            setError('Erro ao carregar pedidos ativos');
        } finally {
            setLoadingData(false);
        }
    };

    const alterarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            const response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: novoStatus })
            });

            if (response.ok) {
                await carregarPedidosAtivos();
                alert('Status alterado com sucesso!');
            } else {
                throw new Error('Erro ao alterar status');
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Erro ao alterar status do pedido');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparando':
                return 'bg-blue-100 text-blue-800';
            case 'pronto':
                return 'bg-green-100 text-green-800';
            case 'finalizado':
                return 'bg-gray-100 text-gray-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-BR');
    };

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco || 0);
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Shield className="text-red-600 mr-3" size={28} />
                        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Sair
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <ShoppingCart className="text-blue-600 mr-3" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Pedidos Ativos</p>
                                <p className="text-2xl font-bold">{pedidosAtivos.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Clock className="text-orange-600 mr-3" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Pendentes</p>
                                <p className="text-2xl font-bold">
                                    {pedidosAtivos.filter(p => p.status === 'pendente').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DollarSign className="text-green-600 mr-3" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Total Ativo</p>
                                <p className="text-2xl font-bold">
                                    {formatarPreco(pedidosAtivos.reduce((total, p) => total + (p.valor_total || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Pedidos */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold">Pedidos Ativos</h2>
                    </div>

                    {pedidosAtivos.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">Nenhum pedido ativo</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {pedidosAtivos.map((pedido) => (
                                <div key={pedido.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-lg">Pedido #{pedido.id}</span>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(pedido.status)}`}>
                                                    {pedido.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>Cliente: {pedido.usuario?.name || pedido.nomeUsuario || 'N/A'}</p>
                                                <p>Data: {formatarData(pedido.createdAt || pedido.data_pedido)}</p>
                                                <p className="font-semibold text-gray-900">Total: {formatarPreco(pedido.valor_total)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {pedido.status === 'pendente' && (
                                                <button
                                                    onClick={() => alterarStatusPedido(pedido.id, 'preparando')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                                >
                                                    <Clock size={16} />
                                                    Preparar
                                                </button>
                                            )}
                                            {pedido.status === 'preparando' && (
                                                <button
                                                    onClick={() => alterarStatusPedido(pedido.id, 'pronto')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                                >
                                                    <Check size={16} />
                                                    Pronto
                                                </button>
                                            )}
                                            {pedido.status === 'pronto' && (
                                                <button
                                                    onClick={() => alterarStatusPedido(pedido.id, 'finalizado')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                                >
                                                    <Check size={16} />
                                                    Finalizar
                                                </button>
                                            )}
                                            {(pedido.status === 'pendente' || pedido.status === 'preparando') && (
                                                <button
                                                    onClick={() => alterarStatusPedido(pedido.id, 'cancelado')}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                                >
                                                    <X size={16} />
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}