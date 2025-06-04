"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';
import { ShoppingBag, AlertTriangle, CheckCircle, CreditCard, User, MapPin } from 'lucide-react';

export default function Checkout() {
  const {
    cartItems,
    loading: cartLoading,
    total,
    fetchCartFromAPI,
    getTotalItems,
  } = useCart();
  
  const { token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Recarrega o carrinho quando a página é acessada
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    }
  }, [token]);

  // Verifica se há problemas de estoque
  const itemsComProblemaEstoque = cartItems.filter(item => 
    !item.estoque || item.estoque < item.quantidade
  );

  const finalizarPedido = async () => {
    if (cartItems.length === 0) {
      setError('Seu carrinho está vazio!');
      return;
    }

    if (itemsComProblemaEstoque.length > 0) {
      setError('Alguns itens não possuem estoque suficiente. Ajuste as quantidades no carrinho.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao criar pedido');
      }

      setSuccess(true);
      
      // Redireciona para página de sucesso após 3 segundos
      setTimeout(() => {
        router.push('/meus-pedidos');
      }, 3000);

    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      setError(err.message || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
          <strong className="block mb-2">Acesso negado!</strong>
          <p>Você precisa estar logado para finalizar a compra.</p>
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl text-gray-500 mb-4">Carrinho vazio</h2>
          <p className="text-gray-400 mb-6">Adicione alguns produtos para finalizar uma compra!</p>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-lg max-w-lg w-full text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h2 className="text-2xl font-bold mb-3">Pedido Realizado com Sucesso!</h2>
          <p className="mb-4">
            Seu pedido foi criado e está sendo processado. 
            Você será redirecionado para acompanhar seus pedidos.
          </p>
          <div className="animate-pulse text-sm text-green-600">
            Redirecionando em alguns segundos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/carrinho')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Voltar ao Carrinho
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-yellow-500" />
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo do Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alertas */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Erro!</strong> {error}
                  </div>
                </div>
              </div>
            )}

            {itemsComProblemaEstoque.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção!</strong> Os seguintes itens não possuem estoque suficiente:
                    <ul className="mt-2 list-disc list-inside">
                      {itemsComProblemaEstoque.map(item => (
                        <li key={item.id}>
                          {item.nome} - Solicitado: {item.quantidade}, Disponível: {item.estoque}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Itens do Pedido */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Itens do Pedido ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'})
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {cartItems.map((item) => {
                  const temEstoqueSuficiente = item.estoque >= item.quantidade;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        !temEstoqueSuficiente ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {item.imagem && (
                          <img
                            src={item.imagem}
                            alt={item.nome}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                          <p className="text-gray-600">R$ {item.preco.toFixed(2)} cada</p>
                          <p className="text-sm text-gray-500">Quantidade: {item.quantidade}</p>
                          {!temEstoqueSuficiente && (
                            <p className="text-sm text-red-600 font-semibold">
                              ⚠️ Estoque insuficiente ({item.estoque} disponível)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${!temEstoqueSuficiente ? 'text-red-600' : 'text-gray-800'}`}>
                          R$ {(item.preco * item.quantidade).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informações do Cliente (placeholder) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações de Entrega
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">Retirada no Local</span>
                  </div>
                  <p className="text-blue-700 mt-2">
                    Este pedido será preparado para retirada no estabelecimento. 
                    Você receberá uma notificação quando estiver pronto.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Resumo do Pedido</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} itens)</span>
                  <span className="font-semibold">R$ {total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega</span>
                  <span className="font-semibold text-green-600">Grátis</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-yellow-600">R$ {total.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={finalizarPedido}
                  disabled={loading || itemsComProblemaEstoque.length > 0}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                    loading || itemsComProblemaEstoque.length > 0
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {loading ? 'Processando...' : 'Confirmar Pedido'}
                </button>
                
                {itemsComProblemaEstoque.length > 0 && (
                  <p className="text-sm text-red-600 text-center">
                    Ajuste as quantidades no carrinho para continuar
                  </p>
                )}
                
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>✅ Pedido será preparado para retirada</p>
                  <p>✅ Pagamento no local</p>
                  <p>✅ Sem taxas adicionais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}