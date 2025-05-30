"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../AuthContexto/ContextoAuth.js";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [addingItemId, setAddingItemId] = useState(null);
  const { token, isAuthenticated, authenticatedFetch, checkTokenValidity } = useAuth();

  // Carrega o carrinho quando o token muda (login/logout)
  useEffect(() => {
    if (isAuthenticated && checkTokenValidity()) {
      fetchCartFromAPI();
    } else {
      // Se não tem token válido, limpa o carrinho local
      setCartItems([]);
      setTotal(0);
    }
  }, [isAuthenticated, token]);

  // Função para buscar carrinho da API
  const fetchCartFromAPI = async () => {
    if (!isAuthenticated || !checkTokenValidity()) {
      console.log("Não autenticado ou token inválido, não é possível buscar carrinho");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Buscando carrinho da API...");
      
      // Verificar se o token ainda existe
      if (!token) {
        console.log("Token não encontrado");
        setCartItems([]);
        setTotal(0);
        return;
      }

      const res = await fetch("http://localhost:3001/api/carrinho", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Resposta da API carrinho:", res.status);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.log("Token inválido, limpando carrinho...");
          setCartItems([]);
          setTotal(0);
          return;
        }
        
        // Para outros erros, tentar pegar a mensagem de erro
        let errorMessage = "Erro ao buscar carrinho";
        try {
          const errorData = await res.json();
          errorMessage = errorData.mensagem || errorData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        
        console.error("Erro HTTP ao buscar carrinho:", res.status, errorMessage);
        setCartItems([]);
        setTotal(0);
        return;
      }

      const data = await res.json();
      console.log("Dados do carrinho recebidos:", data);
      
      // Verificar se os dados estão no formato esperado
      if (!data || typeof data !== 'object') {
        console.error("Dados do carrinho inválidos:", data);
        setCartItems([]);
        setTotal(0);
        return;
      }
      
      // Tratar diferentes estruturas de resposta da API
      let items = [];
      let totalValue = 0;

      if (Array.isArray(data)) {
        // Se data é um array diretamente
        items = data;
      } else if (Array.isArray(data.carrinho)) {
        // Se data tem propriedade carrinho
        items = data.carrinho;
        totalValue = parseFloat(data.total) || 0;
      } else if (Array.isArray(data.items)) {
        // Se data tem propriedade items
        items = data.items;
        totalValue = parseFloat(data.total) || 0;
      } else {
        console.log("Carrinho vazio ou formato não reconhecido");
        setCartItems([]);
        setTotal(0);
        return;
      }
      
      // Mapear os dados da API para o formato esperado pelo frontend
      const mappedItems = items.map((item, index) => {
        // Validar se o item tem as propriedades necessárias
        if (!item || typeof item !== 'object') {
          console.warn("Item do carrinho inválido:", item);
          return null;
        }

        return {
          id: item.id_carrinho_item || item.id || `temp-${index}`,
          id_produto: item.id_produto || item.produto_id,
          nome: item.nome || item.produto_nome || 'Produto sem nome',
          preco: parseFloat(item.preco || item.produto_preco) || 0,
          quantidade: parseInt(item.quantidade) || 1,
          estoque: parseInt(item.estoque || item.produto_estoque) || 0,
          imagem: item.imagemPath ? `http://localhost:3001/api/${item.imagemPath}` : null,
        };
      }).filter(item => item !== null);

      console.log("Itens do carrinho mapeados:", mappedItems);

      // Calcular total se não veio da API
      if (totalValue === 0 && mappedItems.length > 0) {
        totalValue = mappedItems.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
      }

      console.log("Total calculado:", totalValue);

      setCartItems(mappedItems);
      setTotal(totalValue);
      
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
      // Resetar valores em caso de erro
      setCartItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item ao carrinho (API + estado local)
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para adicionar itens ao carrinho");
      return false;
    }

    if (!checkTokenValidity()) {
      alert("Sua sessão expirou. Faça login novamente.");
      return false;
    }

    // Validar produto
    if (!product || !product.id_produto) {
      console.error("Produto inválido:", product);
      alert("Erro: produto inválido");
      return false;
    }

    console.log("Adicionando produto ao carrinho:", product);
    setAddingItemId(product.id_produto);
    
    try {
      const requestBody = {
        produtoId: product.id_produto,
        quantidade: 1,
      };

      console.log("Enviando dados para API:", requestBody);

      const res = await fetch("http://localhost:3001/api/carrinho/itens", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Resposta ao adicionar item:", res.status);
      
      if (!res.ok) {
        let errorMessage = "Erro ao adicionar item";
        try {
          const responseData = await res.json();
          errorMessage = responseData.mensagem || responseData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        
        console.error("Erro HTTP ao adicionar item:", res.status, errorMessage);
        throw new Error(errorMessage);
      }

      const responseData = await res.json();
      console.log("Dados da resposta:", responseData);

      // Recarrega o carrinho após adicionar
      await fetchCartFromAPI();
      
      console.log("Item adicionado ao carrinho com sucesso!");
      return true;
      
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert(err.message || "Erro ao adicionar item ao carrinho");
      return false;
    } finally {
      setAddingItemId(null);
    }
  };

  // Remover item do carrinho
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated || !checkTokenValidity()) return;

    console.log("Removendo item do carrinho:", itemId);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/carrinho/itens/${itemId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Erro ao remover item";
        try {
          const errorData = await res.json();
          errorMessage = errorData.mensagem || errorData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      // Recarrega o carrinho após remover
      await fetchCartFromAPI();
      
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert(err.message || "Erro ao remover item do carrinho");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade
  const updateQuantity = async (itemId, newQuantity) => {
    if (!isAuthenticated || !checkTokenValidity() || newQuantity <= 0) return;

    console.log("Atualizando quantidade:", { itemId, newQuantity });
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/carrinho/itens/${itemId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantidade: newQuantity }),
      });

      if (!res.ok) {
        let errorMessage = "Erro ao atualizar quantidade";
        try {
          const errorData = await res.json();
          errorMessage = errorData.mensagem || errorData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      // Recarrega o carrinho após atualizar
      await fetchCartFromAPI();

    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      alert(err.message || "Erro ao atualizar quantidade");
    } finally {
      setLoading(false);
    }
  };

  // Aumentar quantidade
  const increaseQuantity = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantidade < item.estoque) {
      await updateQuantity(itemId, item.quantidade + 1);
    } else if (item && item.quantidade >= item.estoque) {
      alert("Não há estoque suficiente");
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
    if (!isAuthenticated || !checkTokenValidity()) return;

    console.log("Limpando carrinho...");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/carrinho", {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Erro ao limpar carrinho";
        try {
          const errorData = await res.json();
          errorMessage = errorData.mensagem || errorData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      setCartItems([]);
      setTotal(0);
      
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
      alert(err.message || "Erro ao limpar carrinho");
    } finally {
      setLoading(false);
    }
  };

  // Finalizar compra
  const finalizarCompra = async (dadosPagamento) => {
    if (!isAuthenticated || !checkTokenValidity()) {
      throw new Error("Você precisa estar logado para finalizar a compra");
    }

    if (cartItems.length === 0) {
      throw new Error("Carrinho vazio");
    }

    console.log("Finalizando compra com dados:", dadosPagamento);
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:3001/api/pedidos", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dadosPagamento),
      });

      if (!res.ok) {
        let errorMessage = "Erro ao finalizar compra";
        try {
          const errorData = await res.json();
          errorMessage = errorData.mensagem || errorData.message || errorMessage;
        } catch (e) {
          console.log("Erro ao parsear resposta de erro:", e);
        }
        throw new Error(errorMessage);
      }

      const resultado = await res.json();
      console.log("Compra finalizada:", resultado);

      // Recarregar carrinho (deve estar vazio agora)
      await fetchCartFromAPI();
      
      return resultado;
      
    } catch (err) {
      console.error("Erro ao finalizar compra:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obter total de itens (quantidade)
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantidade || 0), 0);
  };

  // Obter preço total
  const getTotalPrice = () => {
    return total;
  };

  // Verifica se um item específico está sendo adicionado
  const isAddingItem = (productId) => {
    return addingItemId === productId;
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
        finalizarCompra,
        isAuthenticated,
        isAddingItem,
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
