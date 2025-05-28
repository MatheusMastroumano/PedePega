"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../AuthContexto/ContextoAuth.js"; // Ajuste o caminho conforme necessário

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const { token } = useAuth();

  // Carrega o carrinho quando o token muda (login/logout)
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    } else {
      // Se não tem token, limpa o carrinho local
      setCartItems([]);
      setTotal(0);
    }
  }, [token]);

  // Função para buscar carrinho da API
  const fetchCartFromAPI = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/carrinho", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar carrinho");
      }

      const data = await res.json();
      
      // Mapear os dados da API para o formato esperado pelo frontend
      const mappedItems = data.carrinho?.map((item) => ({
        id: item.id_carrinho_item,
        id_produto: item.id_produto,
        nome: item.nome,
        preco: parseFloat(item.preco),
        quantidade: item.quantidade,
        estoque: item.estoque,
        imagem: item.imagemPath,
      })) || [];

      setCartItems(mappedItems);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item ao carrinho (API + estado local)
  const addToCart = async (product) => {
    if (!token) {
      alert("Você precisa estar logado para adicionar itens ao carrinho");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/carrinho/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produtoId: product.id_produto,
          quantidade: 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensagem || "Erro ao adicionar item");
      }

      // Recarrega o carrinho após adicionar
      await fetchCartFromAPI();
      
      // Feedback visual
      alert("Item adicionado ao carrinho com sucesso!");
      
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remover item do carrinho
  const removeFromCart = async (itemId) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/carrinho/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao remover item");
      }

      // Atualiza o estado local removendo o item
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      
      // Recalcula o total
      const newItems = cartItems.filter((item) => item.id !== itemId);
      const newTotal = newItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
      setTotal(newTotal);
      
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("Erro ao remover item do carrinho");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade
  const updateQuantity = async (itemId, newQuantity) => {
    if (!token || newQuantity <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/carrinho/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantidade: newQuantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensagem || "Erro ao atualizar quantidade");
      }

      // Atualiza o estado local
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantidade: newQuantity } : item
        )
      );

      // Recalcula o total
      const updatedItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantidade: newQuantity } : item
      );
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
      setTotal(newTotal);

    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aumentar quantidade
  const increaseQuantity = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      await updateQuantity(itemId, item.quantidade + 1);
    }
  };

  // Diminuir quantidade
  const decreaseQuantity = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantidade > 1) {
      await updateQuantity(itemId, item.quantidade - 1);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/carrinho", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao limpar carrinho");
      }

      setCartItems([]);
      setTotal(0);
      
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
      alert("Erro ao limpar carrinho");
    } finally {
      setLoading(false);
    }
  };

  // Obter total de itens (quantidade)
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  };

  // Obter preço total
  const getTotalPrice = () => {
    return total;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        total,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        fetchCartFromAPI,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
};