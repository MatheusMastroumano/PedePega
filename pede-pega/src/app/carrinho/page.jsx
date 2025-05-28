"use client";
import React, { useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js"; // Ajuste o caminho conforme necessário

const Carrinho = () => {
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

  // Recarrega o carrinho quando a página é acessada
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    }
  }, [token]);

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
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
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
                    <p className="text-sm text-gray-500">Estoque disponível: {item.estoque}</p>
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
                    
                    <span className="w-12 text-center font-semibold text-lg">
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
                    <p className="text-lg font-bold text-gray-800">
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
          ))}

          {/* Footer com total e botão de finalizar */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg text-gray-600">Total de itens: {getTotalItems()}</p>
                <p className="text-2xl font-bold text-gray-800">Total: R$ {total.toFixed(2)}</p>
              </div>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                disabled={loading}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrinho;