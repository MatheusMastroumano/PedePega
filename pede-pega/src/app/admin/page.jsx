
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ShoppingCart, 
  Package, 
  Clock, 
  Check, 
  X, 
  DollarSign, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AdminPage() {
    const { isAuthenticated, isAdmin, loading, authenticatedFetch, logout } = useAuth();
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' ou 'produtos'
    const [showProdutoForm, setShowProdutoForm] = useState(false);
    const [produtoEditando, setProdutoEditando] = useState(null);
    const [pedidoDetalhes, setPedidoDetalhes] = useState(null);
    const [showPedidoDetalhes, setShowPedidoDetalhes] = useState(false);
    const router = useRouter();

    // Form states para produto
    const [produtoForm, setProdutoForm] = useState({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        capa: null
    });

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !isAdmin) {
                router.push('/FormLoginRegister');
                return;
            }
            carregarDados();
        }
    }, [loading, isAuthenticated, isAdmin, activeTab]);

    const carregarDados = async () => {
        try {
            setLoadingData(true);
            if (activeTab === 'pedidos') {
                await carregarPedidosAtivos();
            } else {
                await carregarProdutos();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setError('Erro ao carregar dados');
        } finally {
            setLoadingData(false);
        }
    };

    const carregarPedidosAtivos = async () => {
        try {
            const response = await authenticatedFetch('http://localhost:3001/api/admin/pedidos/ativos');
            if (response.ok) {
                const data = await response.json();
                setPedidosAtivos(data.pedidos || data || []);
            } else {
                throw new Error('Erro ao carregar pedidos');
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            setError('Erro ao carregar pedidos ativos');
        }
    };

    const carregarProdutos = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/produtos');
            if (response.ok) {
                const data = await response.json();
                setProdutos(data.produtos || data || []);
            } else {
                throw new Error('Erro ao carregar produtos');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setError('Erro ao carregar produtos');
        }
    };

    const carregarDetalhesPedido = async (pedidoId) => {
        try {
            const response = await authenticatedFetch(`http://localhost:3001/api/admin/pedidos/${pedidoId}/itens`);
            if (response.ok) {
                const data = await response.json();
                setPedidoDetalhes(data);
                setShowPedidoDetalhes(true);
            } else {
                throw new Error('Erro ao carregar detalhes do pedido');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            alert('Erro ao carregar detalhes do pedido');
        }
    };

    const alterarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            const response = await authenticatedFetch(`http://localhost:3001/api/admin/pedidos/${pedidoId}/status`, {
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
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao alterar status');
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert(error.message || 'Erro ao alterar status do pedido');
        }
    };

    const handleProdutoSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('nome', produtoForm.nome);
            formData.append('descricao', produtoForm.descricao);
            formData.append('preco', produtoForm.preco);
            formData.append('estoque', produtoForm.estoque);
            
            if (produtoForm.capa) {
                formData.append('capa', produtoForm.capa);
            }

            const url = produtoEditando 
                ? `http://localhost:3001/api/produtos/${produtoEditando.id}`
                : 'http://localhost:3001/api/produtos';
            
            const method = produtoEditando ? 'PUT' : 'POST';

            const response = await authenticatedFetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                alert(produtoEditando ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
                setShowProdutoForm(false);
                setProdutoEditando(null);
                setProdutoForm({ nome: '', descricao: '', preco: '', estoque: '', capa: null });
                await carregarProdutos();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao salvar produto');
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert(error.message || 'Erro ao salvar produto');
        }
    };

    const editarProduto = (produto) => {
        setProdutoEditando(produto);
        setProdutoForm({
            nome: produto.nome,
            descricao: produto.descricao || '',
            preco: produto.preco.toString(),
            estoque: produto.estoque.toString(),
            capa: null
        });
        setShowProdutoForm(true);
    };

    const deletarProduto = async (produtoId) => {
        if (!confirm('Tem certeza que deseja deletar este produto?')) return;

        try {
            const response = await authenticatedFetch(`http://localhost:3001/api/produtos/${produtoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Produto deletado com sucesso!');
                await carregarProdutos();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao deletar produto');
            }
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            alert(error.message || 'Erro ao deletar produto');
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
        if (!data) return 'Data não disponível';
        return new Date(data).toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    if (showPedidoDetalhes && pedidoDetalhes) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => setShowPedidoDetalhes(false)}
                                className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <Shield className="text-red-600 mr-3" size={28} />
                            <h1 className="text-2xl font-bold text-gray-900">
                                Detalhes do Pedido #{pedidoDetalhes.pedido?.id}
                            </h1>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Sair
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">Pedido #{pedidoDetalhes.pedido?.id}</h2>
                                    <p className="text-gray-600">
                                        Cliente: {pedidoDetalhes.pedido?.usuario?.name || pedidoDetalhes.pedido?.nome_usuario || 'N/A'}
                                    </p>
                                    <p className="text-gray-600">
                                        Data: {formatarData(pedidoDetalhes.pedido?.createdAt || pedidoDetalhes.pedido?.data_pedido)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pedidoDetalhes.pedido?.status)}`}>
                                    {pedidoDetalhes.pedido?.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Itens do Pedido</h3>
                            <div className="space-y-4">
                                {pedidoDetalhes.itens?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            {item.produto?.imagem && (
                                                <img
                                                    src={item.produto.imagem}
                                                    alt={item.produto.nome}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            )}
                                            <div>
                                                <h4 className="font-semibold">{item.produto?.nome || 'Produto N/A'}</h4>
                                                <p className="text-gray-600">Quantidade: {item.quantidade}</p>
                                                <p className="text-gray-600">Preço unitário: {formatarPreco(item.preco_unitario)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">
                                                {formatarPreco(item.preco_unitario * item.quantidade)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total:</span>
                                    <span>{formatarPreco(pedidoDetalhes.pedido?.valor_total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showProdutoForm) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    setShowProdutoForm(false);
                                    setProdutoEditando(null);
                                    setProdutoForm({ nome: '', descricao: '', preco: '', estoque: '', capa: null });
                                }}
                                className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <Shield className="text-red-600 mr-3" size={28} />
                            <h1 className="text-2xl font-bold text-gray-900">
                                {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                            </h1>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Sair
                        </button>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <form onSubmit={handleProdutoSubmit} className="bg-white rounded-lg shadow p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Produto *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={produtoForm.nome}
                                    onChange={(e) => setProdutoForm({...produtoForm, nome: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={produtoForm.descricao}
                                    onChange={(e) => setProdutoForm({...produtoForm, descricao: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preço (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={produtoForm.preco}
                                        onChange={(e) => setProdutoForm({...produtoForm, preco: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estoque *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={produtoForm.estoque}
                                        onChange={(e) => setProdutoForm({...produtoForm, estoque: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Imagem do Produto
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProdutoForm({...produtoForm, capa: e.target.files[0]})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formatos aceitos: JPEG, PNG, GIF, WebP (máx. 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {produtoEditando ? 'Atualizar Produto' : 'Criar Produto'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProdutoForm(false);
                                    setProdutoEditando(null);
                                    setProdutoForm({ nome: '', descricao: '', preco: '', estoque: '', capa: null });
                                }}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-1 mb-8">
                    <button
                        onClick={() => setActiveTab('pedidos')}
                        className={`px-6 py-3 rounded-lg font-semibold ${
                            activeTab === 'pedidos'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <ShoppingCart className="inline mr-2" size={20} />
                        Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('produtos')}
                        className={`px-6 py-3 rounded-lg font-semibold ${
                            activeTab === 'produtos'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Package className="inline mr-2" size={20} />
                        Produtos
                    </button>
                </div>

                {activeTab === 'pedidos' && (
                    <>
                        {/* Estatísticas de Pedidos */}
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
                                        <div key={`pedido-${pedido.id}-${pedido.status}`} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-semibold text-lg">Pedido #{pedido.id}</span>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(pedido.status)}`}>
                                                            {pedido.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>Cliente: {pedido.usuario?.name || pedido.nomeUsuario || pedido.nome_usuario || 'N/A'}</p>
                                                        <p>Data: {formatarData(pedido.createdAt || pedido.data_pedido || pedido.created_at)}</p>
                                                        <p className="font-semibold text-gray-900">Total: {formatarPreco(pedido.valor_total || pedido.total)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => carregarDetalhesPedido(pedido.id)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        Ver Detalhes
                                                    </button>
                                                    
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
                    </>
                )}

                {activeTab === 'produtos' && (
                    <>
                        {/* Header de Produtos */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h2>
                            <button
                                onClick={() => setShowProdutoForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Novo Produto
                            </button>
                        </div>

                        {/* Lista de Produtos */}
                        <div className="bg-white rounded-lg shadow">
                            {produtos.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">Nenhum produto cadastrado</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {produtos.map((produto) => (
                                        <div key={produto.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                            {produto.imagem && (
                                                <img
                                                    src={produto.imagem}
                                                    alt={produto.nome}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-2">{produto.nome}</h3>
                                                {produto.descricao && (
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                        {produto.descricao}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatarPreco(produto.preco)}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        produto.estoque > 0 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        Estoque: {produto.estoque}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editarProduto(produto)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                                    >
                                                        <Edit size={16} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => deletarProduto(produto.id)}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Deletar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}