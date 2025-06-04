"use client";
import React, { useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';

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
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-2">Carregando carrinho...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Acesso negado!</strong> Você precisa estar logado para ver o carrinho.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Carrinho de Compras</h2>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            Limpar Carrinho
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl text-gray-500 mb-4">Seu carrinho está vazio</p>
          <p className="text-gray-400">Adicione alguns produtos para começar suas compras!</p>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Ver Produtos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header do carrinho */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
              </span>
              <span className="text-2xl font-bold text-yellow-600">
                Total: R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Lista de itens */}
          {cartItems.map((item) => {
            const temEstoqueSuficiente = item.estoque >= item.quantidade;
            
            return (
              <div key={item.id} className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${!temEstoqueSuficiente ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
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
                          <span className="block text-red-600">⚠️ Estoque insuficiente!</span>
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
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      
                      <span className={`w-12 text-center font-semibold text-lg ${!temEstoqueSuficiente ? 'text-red-600' : ''}`}>
                        {item.quantidade}
                      </span>
                      
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        disabled={loading || item.quantidade >= item.estoque}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        +
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
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Verificação de estoque */}
          {cartItems.some(item => item.estoque < item.quantidade) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong>Atenção!</strong> Alguns itens em seu carrinho não possuem estoque suficiente. 
                  Ajuste as quantidades ou remova os itens para continuar.
                </div>
              </div>
            </div>
          )}

          {/* Footer com total e botão de finalizar */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg text-gray-600">Total de itens: {getTotalItems()}</p>
                <p className="text-2xl font-bold text-gray-800">Total: R$ {total.toFixed(2)}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/PaginaProdutos')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
                  disabled={loading}
                >
                  Continuar Comprando
                </button>
                <button
                  onClick={handleFinalizarCompra}
                  className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
                    cartItems.some(item => item.estoque < item.quantidade) || loading
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-green-500 hover:bg-green-600 text-white'
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
  );
};