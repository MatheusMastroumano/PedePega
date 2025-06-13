"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';
import { ShoppingBag, AlertTriangle } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { cartItems, total, fetchCartFromAPI, finalizarCompra } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:3001/api';

  // Recarrega o carrinho quando a página é acessada
  useEffect(() => {
    const initializePage = async () => {
      try {
        if (token) {
          await fetchCartFromAPI();
        }
      } catch (error) {
        console.error('Erro ao inicializar página:', error);
        setError('Erro ao carregar dados do pedido');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [token]);

  const finalizarPedido = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar a função finalizarCompra do contexto do carrinho
      await finalizarCompra();

      // Redirecionar para a página correta de pedidos do cliente
      router.push('/clientePedidos');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Carrinho Vazio</h2>
          <p className="mt-2 text-gray-600">Adicione itens ao seu carrinho para continuar</p>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Ver Produtos
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Finalize seu pedido</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo do Pedido</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`cart-item-${item.id_produto}`} className="flex items-center py-3 border-b border-gray-100">
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-gray-800 font-medium">{item.nome}</h3>
                    <p className="text-gray-600">Quantidade: {item.quantidade}</p>
                    <p className="text-gray-800 font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-yellow-600">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Finalizar Compra */}
          <button
            onClick={finalizarPedido}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {loading ? 'Processando...' : 'Finalizar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
}