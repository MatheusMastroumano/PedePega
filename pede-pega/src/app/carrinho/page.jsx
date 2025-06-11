"use client";
import React, { useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function CarrinhoPage() {
  const {
    cartItems,
    loading,
    total,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    fetchCartFromAPI,
    getTotalItems,
  } = useCart();
  
  const { token } = useAuth();
  const router = useRouter();

  // Recarrega o carrinho quando a página é acessada
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    }
  }, [token]);

  const handleFinalizarCompra = () => {
    // Verifica se há itens no carrinho
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    // Verifica se há estoque suficiente para todos os itens
    const itemsSemEstoque = cartItems.filter(item => 
      !item.estoque || item.estoque < item.quantidade
    );

    if (itemsSemEstoque.length > 0) {
      const nomes = itemsSemEstoque.map(item => item.nome).join(', ');
      alert(`Os seguintes itens não possuem estoque suficiente: ${nomes}`);
      return;
    }

    // Redireciona para a página de checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="p-4 text-center flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
          <strong className="block mb-2">Acesso negado!</strong>
          <p>Você precisa estar logado para ver o carrinho.</p>
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

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-yellow-500" />
            Carrinho de Compras
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Limpar Carrinho</span>
              <span className="sm:hidden">Limpar</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Estado vazio */
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl sm:text-2xl text-gray-500 mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-400 mb-6 px-4">Adicione alguns produtos para começar suas compras!</p>
            <button
              onClick={() => router.push('/PaginaProdutos')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo do carrinho */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-lg font-semibold text-gray-700">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
                </span>
                <span className="text-2xl font-bold text-yellow-600">
                  Total: R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Lista de itens */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const temEstoqueSuficiente = item.estoque >= item.quantidade;
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${
                      !temEstoqueSuficiente ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Layout Mobile */}
                    <div className="block sm:hidden space-y-4">
                      {/* Imagem e info básica */}
                      <div className="flex items-start gap-3">
                        {item.imagem && (
                          <img
                            src={item.imagem}
                            alt={item.nome}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{item.nome}</h3>
                          <p className="text-gray-600 text-sm">R$ {item.preco.toFixed(2)} cada</p>
                          <p className={`text-sm ${temEstoqueSuficiente ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>
                            Estoque: {item.estoque}
                          </p>
                          {!temEstoqueSuficiente && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Estoque insuficiente!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controles e total */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={loading || item.quantidade <= 1}
                            className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className={`w-8 text-center text-black font-semibold ${!temEstoqueSuficiente ? 'text-red-600' : ''}`}>
                            {item.quantidade}
                          </span>
                          
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            disabled={loading || item.quantidade >= item.estoque}
                            className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${!temEstoqueSuficiente ? 'text-red-600' : 'text-gray-800'}`}>
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            disabled={loading}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Layout Desktop */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.imagem && (
                          <img
                            src={item.imagem}
                            alt={item.nome}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{item.nome}</h3>
                          <p className="text-gray-600">Preço unitário: R$ {item.preco.toFixed(2)}</p>
                          <p className={`text-sm ${temEstoqueSuficiente ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>
                            Estoque disponível: {item.estoque}
                            {!temEstoqueSuficiente && (
                              <span className="block text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Estoque insuficiente!
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Controles de quantidade */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={loading || item.quantidade <= 1}
                            className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className={`w-12 text-center text-black font-semibold text-lg ${!temEstoqueSuficiente ? 'text-red-600' : ''}`}>
                            {item.quantidade}
                          </span>
                          
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            disabled={loading || item.quantidade >= item.estoque}
                            className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[100px]">
                          <p className={`text-lg font-bold ${!temEstoqueSuficiente ? 'text-red-600' : 'text-gray-800'}`}>
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </p>
                        </div>

                        {/* Botão remover */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={loading}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden lg:inline">Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alerta de estoque */}
            {cartItems.some(item => item.estoque < item.quantidade) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção!</strong> Alguns itens em seu carrinho não possuem estoque suficiente. 
                    Ajuste as quantidades ou remova os itens para continuar.
                  </div>
                </div>
              </div>
            )}

            {/* Footer com total e botões */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky bottom-0 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm sm:text-lg text-gray-600">
                    Total de itens: {getTotalItems()}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    Total: R$ {total.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                  <button
                    onClick={() => router.push('/PaginaProdutos')}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-lg font-semibold transition-colors order-2 sm:order-1"
                    disabled={loading}
                  >
                    Continuar Comprando
                  </button>
                  
                  <button
                    onClick={handleFinalizarCompra}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-lg font-semibold transition-colors order-1 sm:order-2 ${
                      cartItems.some(item => item.estoque < item.quantidade) || loading
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                        : 'bg-yellow-400 hover:bg-yellow-600 text-white'
                    }`}
                    disabled={cartItems.some(item => item.estoque < item.quantidade) || loading}
                  >
                    {loading ? 'Processando...' : 'Finalizar Compra'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};