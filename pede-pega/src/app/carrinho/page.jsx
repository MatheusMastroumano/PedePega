"use client";
import React, { useEffect, useState } from "react";

const Carrinho = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchCarrinho = async () => {
      try {
        const res = await fetch("/models/Carrinho.js", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar o carrinho");

        const data = await res.json();

        setCartItems(data);
        calcularTotal(data);
      } catch (err) {
        console.error("Erro ao carregar o carrinho:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrinho();
  }, [token]);

  const calcularTotal = (itens) => {
    const total = itens.reduce((sum, item) => {
      const preco = item.preco || item.price || 0;
      const quantidade = item.quantidade || item.quantity || 1;
      return sum + preco * quantidade;
    }, 0);
    setTotal(total);
  };

  const removerItem = async (itemId) => {
    try {
      const res = await fetch(`${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao remover o item");

      const novosItens = cartItems.filter((item) => item.id !== itemId);
      setCartItems(novosItens);
      calcularTotal(novosItens);
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

  if (loading) return <div className="p-4 text-center">Carregando...</div>;

  if (!token) return <div className="p-4 text-center text-red-500">Usuário não autenticado.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Carrinho de Compras</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Seu carrinho está vazio.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 shadow rounded-lg">
              <div>
                <h3 className="text-lg font-medium">{item.nome || item.name}</h3>
                <p className="text-gray-600">
                  Quantidade: {item.quantidade || item.quantity}
                </p>
                <p className="text-gray-600">
                  Preço: R$ {(item.preco || item.price).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removerItem(item.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Remover
              </button>
            </div>
          ))}
          <div className="text-xl font-bold text-right">Total: R$ {total.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default Carrinho;
