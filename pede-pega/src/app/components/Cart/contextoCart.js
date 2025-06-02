"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../AuthContexto/ContextoAuth.js";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [addingItemId, setAddingItemId] = useState(null);
  const { token, isAuthenticated, checkTokenValidity } = useAuth();

  // Vai Carregar o carrinho quando fizer login ou logout
  useEffect(() => {
    if (isAuthenticated && checkTokenValidity()) {
      fetchCartFromAPI();
    } else {
      // Se não tem token válido limpa o carrinho atual
      setCartItems([]);
      setTotal(0);
    }
  }, [isAuthenticated, token]);

  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!isAuthenticated || !checkTokenValidity()) {
      throw new Error('Não autenticado ou token inválido');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      try {
        const errorData = await response.json();
        errorMessage = errorData.mensagem || errorData.message || errorMessage;
      } catch (e) {
        console.log('Erro ao parsear resposta de erro:', e);
      }
      throw new Error(errorMessage);
    }

    return response;
  };

  const fetchCartFromAPI = async () => {
    if (!isAuthenticated || !checkTokenValidity()) {
      console.log("Não autenticado, limpando carrinho local");
      setCartItems([]);
      setTotal(0);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Buscando carrinho da API...");
      
      //GET /api/carrinho
      const response = await makeAuthenticatedRequest("http://localhost:3001/api/carrinho");
      const data = await response.json();

      console.log("Dados do carrinho recebidos:", data);
      
      let items = [];
      let totalValue = 0;

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.carrinho)) {
        items = data.carrinho;
        totalValue = parseFloat(data.total) || 0;
      } else if (Array.isArray(data.items)) {
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

      // Calcular total se não veio da API
      if (totalValue === 0 && mappedItems.length > 0) {
        totalValue = mappedItems.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
      }

      console.log("Itens mapeados:", mappedItems);
      console.log("Total calculado:", totalValue);

      setCartItems(mappedItems);
      setTotal(totalValue);
      
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
      setCartItems([]);
      setTotal(0);
      
      // Se erro de autenticação, não mostrar alert
      if (!err.message.includes('autenticado') && !err.message.includes('401')) {
        alert(err.message || 'Erro ao carregar carrinho');
      }
    } finally {
      setLoading(false);
    }
  };

  // CORRIGIDO Adicionar item ao carrinho
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

      const response = await makeAuthenticatedRequest("http://localhost:3001/api/carrinho/itens", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log("Dados da resposta:", responseData);

      // Vai recarrega o carrinho após adicionar
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

  // remove o item do carrinho
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated || !checkTokenValidity()) return;

    console.log("Removendo item do carrinho:", itemId);
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`http://localhost:3001/api/carrinho/itens/${itemId}`, {
        method: "DELETE",
      });

      // recarega o carrinho apos remover algum item
      await fetchCartFromAPI();
      
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert(err.message || "Erro ao remover item do carrinho");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (!isAuthenticated || !checkTokenValidity() || newQuantity <= 0) return;

    console.log("Atualizando quantidade:", { itemId, newQuantidade: newQuantity });
    setLoading(true);
    try {
      await makeAuthenticatedRequest(`http://localhost:3001/api/carrinho/itens/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantidade: newQuantity }),
      });

      // recarrega o carrinho apos atualizar
      await fetchCartFromAPI();

    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      alert(err.message || "Erro ao atualizar quantidade");
    } finally {
      setLoading(false);
    }
  };

  // aumentar quantidade
  const increaseQuantity = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantidade < item.estoque) {
      await updateQuantity(itemId, item.quantidade + 1);
    } else if (item && item.quantidade >= item.estoque) {
      alert("Não há estoque suficiente");
    }
  };

  // diminuir quantidade
  const decreaseQuantity = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantidade > 1) {
      await updateQuantity(itemId, item.quantidade - 1);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !checkTokenValidity()) return;

    console.log("Limpando carrinho...");
    setLoading(true);
    try {
      await makeAuthenticatedRequest("http://localhost:3001/api/carrinho", {
        method: "DELETE",
      });

      setCartItems([]);
      setTotal(0);
      
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
      alert(err.message || "Erro ao limpar carrinho");
    } finally {
      setLoading(false);
    }
  };


  const finalizarCompra = async (dadosPagamento = {}) => {
    if (!isAuthenticated || !checkTokenValidity()) {
      throw new Error("Você precisa estar logado para finalizar a compra");
    }

    if (cartItems.length === 0) {
      throw new Error("Carrinho vazio");
    }

    console.log("Finalizando compra...");
    setLoading(true);
    
    try {
      const response = await makeAuthenticatedRequest("http://localhost:3001/api/pedido", {
        method: "POST",
        body: JSON.stringify(dadosPagamento),
      });

      const resultado = await response.json();
      console.log("Compra finalizada:", resultado);
      await fetchCartFromAPI();
      
      return resultado;
      
    } catch (err) {
      console.error("Erro ao finalizar compra:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listarPedidos = async () => {
    if (!isAuthenticated || !checkTokenValidity()) {
      throw new Error("Você precisa estar logado");
    }

    try {
      const response = await makeAuthenticatedRequest("http://localhost:3001/api/pedido");
      const pedidos = await response.json();
      
      console.log("Pedidos recebidos:", pedidos);
      return pedidos;
      
    } catch (err) {
      console.error("Erro ao listar pedidos:", err);
      throw err;
    }
  };

  const obterItensPedido = async (pedidoId) => {
    if (!isAuthenticated || !checkTokenValidity()) {
      throw new Error("Você precisa estar logado");
    }

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:3001/api/pedido/${pedidoId}/itens`);
      const itens = await response.json();
      
      console.log("Itens do pedido recebidos:", itens);
      return itens;
      
    } catch (err) {
      console.error("Erro ao obter itens do pedido:", err);
      throw err;
    }
  };

  // obter total de itens
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantidade || 0), 0);
  };

  // obter preço total
  const getTotalPrice = () => {
    return total;
  };

  // verifica se um item específico está sendo adicionado
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
        isAddingItem,
        obterItensPedido,
        listarPedidos
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
