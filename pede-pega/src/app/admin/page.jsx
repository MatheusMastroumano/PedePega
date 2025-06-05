'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Package, Users, ShoppingCart, AlertCircle, Plus, Edit, Trash2, Eye, Check, Clock, X, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AdminPage() {
    const { isAuthenticated, isAdmin, loading, adminFetch, authenticatedFetch, logout } = useAuth();
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingProdutos, setLoadingProdutos] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('pedidos');
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [itensPedido, setItensPedido] = useState([]);
    const [loadingItens, setLoadingItens] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
                // Fallback para rota normal se admin não funcionar
                const normalResponse = await authenticatedFetch('http://localhost:3001/api/pedidos/ativos');
                if (normalResponse.ok) {
                    const data = await normalResponse.json();
                    setPedidosAtivos(data);
                } else {
                    throw new Error('Erro ao carregar pedidos');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos ativos:', error);
            setError('Erro ao carregar pedidos ativos');

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

    const carregarItensPedido = async (pedidoId) => {
        try {
            setLoadingItens(true);

            let response;
            try {
                response = await adminFetch(`http://localhost:3001/api/admin/pedidos/${pedidoId}/itens`);
            } catch {
                response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/itens`);
            }

            if (response.ok) {
                const data = await response.json();
                setItensPedido(data);
            } else {
                throw new Error('Erro ao carregar itens do pedido');
            }
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            alert('Erro ao carregar itens do pedido');
        } finally {
            setLoadingItens(false);
        }
    };

    const alterarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            let response;
            try {
                response = await adminFetch(`http://localhost:3001/api/admin/pedidos/${pedidoId}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: novoStatus })
                });
            } catch {
                // Fallback para rota normal baseada no status
                if (novoStatus === 'finalizado') {
                    response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/finalizar`, {
                        method: 'PATCH'
                    });
                } else if (novoStatus === 'cancelado') {
                    response = await authenticatedFetch(`http://localhost:3001/api/pedidos/${pedidoId}/cancelar`, {
                        method: 'PATCH'
                    });
                }
            }

            if (response.ok) {
                await carregarPedidosAtivos();
                alert('Status do pedido alterado com sucesso!');
                setShowModal(false);
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
        }).format(preco);
    };

    const calcularTotalPedido = (itens) => {
        return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const abrirModalPedido = async (pedido) => {
        setSelectedPedido(pedido);
        setShowModal(true);
        await carregarItensPedido(pedido.id);
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
                        <button
                            onClick={() => setError('')}
                            className="ml-auto text-red-700 hover:text-red-900"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            <Clock className="text-orange-600 mr-3" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Pedidos Pendentes</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pedidosAtivos.filter(p => p.status === 'pendente').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DollarSign className="text-purple-600 mr-3" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Valor Total Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatarPreco(pedidosAtivos.reduce((total, p) => total + (p.total || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegação entre seções */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveSection('pedidos')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeSection === 'pedidos'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingCart className="inline mr-2" size={20} />
                            Pedidos
                        </button>
                        <button
                            onClick={() => setActiveSection('produtos')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeSection === 'produtos'
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
                            <h2 className="text-xl font-semibold text-gray-900">Pedidos</h2>
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
                                        <tr key={pedido.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{pedido.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {pedido.usuario?.name || pedido.nomeUsuario || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pedido.status)}`}>
                                                    {pedido.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatarPreco(pedido.total || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatarData(pedido.createdAt || pedido.data_pedido)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => abrirModalPedido(pedido)}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    Ver
                                                </button>
                                                {pedido.status === 'pendente' && (
                                                    <button
                                                        onClick={() => alterarStatusPedido(pedido.id, 'preparando')}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                    >
                                                        <Clock size={16} className="mr-1" />
                                                        Preparar
                                                    </button>
                                                )}
                                                {pedido.status === 'preparando' && (
                                                    <button
                                                        onClick={() => alterarStatusPedido(pedido.id, 'pronto')}
                                                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                                                    >
                                                        <Check size={16} className="mr-1" />
                                                        Pronto
                                                    </button>
                                                )}
                                                {pedido.status === 'pronto' && (
                                                    <button
                                                        onClick={() => alterarStatusPedido(pedido.id, 'finalizado')}
                                                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                                                    >
                                                        <Check size={16} className="mr-1" />
                                                        Finalizar
                                                    </button>
                                                )}
                                                {(pedido.status === 'pendente' || pedido.status === 'preparando') && (
                                                    <button
                                                        onClick={() => alterarStatusPedido(pedido.id, 'cancelado')}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    >
                                                        <X size={16} className="mr-1" />
                                                        Cancelar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {pedidosAtivos.length === 0 && !loadingData && (
                                <div className="text-center py-12">
                                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido ativo</h3>
                                    <p className="mt-1 text-sm text-gray-500">Não há pedidos ativos no momento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Seção de Produtos */}
                {activeSection === 'produtos' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Produtos</h2>
                            <button
                                onClick={() => router.push('/admin/produtos/novo')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <Plus size={20} className="mr-2" />
                                Novo Produto
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Imagem
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoria
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produtos.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex-shrink-0 h-16 w-16">
                                                    {produto.imagem ? (
                                                        <img
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                            src={produto.imagem}
                                                            alt={produto.nome}
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-product.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {produto.descricao}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {produto.categoria || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatarPreco(produto.preco)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.ativo
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {produto.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => router.push(`/admin/produtos/${produto.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/produtos/${produto.id}/editar`)}
                                                    className="text-green-600 hover:text-green-900 inline-flex items-center"
                                                >
                                                    <Edit size={16} className="mr-1" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => deletarProduto(produto.id)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                >
                                                    <Trash2 size={16} className="mr-1" />
                                                    Deletar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {produtos.length === 0 && !loadingProdutos && (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                                    <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro produto.</p>
                                    <button
                                        onClick={() => router.push('/admin/produtos/novo')}
                                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Criar Produto
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes do Pedido */}
                {showModal && selectedPedido && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Detalhes do Pedido #{selectedPedido.id}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Cliente</p>
                                            <p className="font-medium">{selectedPedido.usuario?.name || selectedPedido.nomeUsuario || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPedido.status)}`}>
                                                {selectedPedido.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Data do Pedido</p>
                                            <p className="font-medium">{formatarData(selectedPedido.createdAt || selectedPedido.data_pedido)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="font-medium text-lg">{formatarPreco(selectedPedido.total || 0)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Itens do Pedido</h4>
                                    {loadingItens ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="text-sm text-gray-600 mt-2">Carregando itens...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {itensPedido.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.produto?.nome || item.nome}</p>
                                                        <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatarPreco(item.preco)}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Total: {formatarPreco(item.preco * item.quantidade)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {itensPedido.length === 0 && (
                                                <p className="text-center text-gray-500 py-4">Nenhum item encontrado</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Fechar
                                    </button>

                                    {selectedPedido.status === 'pendente' && (
                                        <button
                                            onClick={() => alterarStatusPedido(selectedPedido.id, 'preparando')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <Clock size={16} className="mr-1" />
                                            Preparar
                                        </button>
                                    )}

                                    {selectedPedido.status === 'preparando' && (
                                        <button
                                            onClick={() => alterarStatusPedido(selectedPedido.id, 'pronto')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <Check size={16} className="mr-1" />
                                            Marcar como Pronto
                                        </button>
                                    )}

                                    {selectedPedido.status === 'pronto' && (
                                        <button
                                            onClick={() => alterarStatusPedido(selectedPedido.id, 'finalizado')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <Check size={16} className="mr-1" />
                                            Finalizar
                                        </button>
                                    )}

                                    {(selectedPedido.status === 'pendente' || selectedPedido.status === 'preparando') && (
                                        <button
                                            onClick={() => alterarStatusPedido(selectedPedido.id, 'cancelado')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                        >
                                            <X size={16} className="mr-1" />
                                            Cancelar
                                        </button>
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