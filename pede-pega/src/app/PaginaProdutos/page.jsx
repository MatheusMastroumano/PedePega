'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../components/Cart/contextoCart';
import { useAuth } from '../components/AuthContexto/ContextoAuth';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''; 


export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, loading: cartLoading } = useCart();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [addingItemId, setAddingItemId] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);
  const isAddingItem = (productId) => addingItemId === productId;
  const isAddedItem = (productId) => addedProductId === productId;

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setError(null);
        console.log('Buscando produtos...');

        const res = await fetch(`http://localhost:3001/api/produtos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Status resposta produtos:', res.status);

        if (!res.ok) {
          let errorMessage = 'Erro ao buscar produtos';
          try {
            const errorData = await res.json();
            errorMessage = errorData.mensagem || errorData.message || errorMessage;
          } catch (e) {
            console.error('Erro ao parsear resposta de erro:', e);
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log('Produtos recebidos:', data);

        if (!Array.isArray(data)) {
          console.error('Resposta não é um array:', data);
          throw new Error('Formato de dados inválido');
        }

        setProdutos(data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError(err.message || 'Erro ao carregar produtos');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProdutos();
  }, ['http://localhost:3001/produtos']);

  const handleAddToCart = async (produto) => {
    try {
      // Validações
      if (!produto || !produto.id_produto) {
        console.error('Produto inválido:', produto);
        alert('Erro: produto inválido');
        return;
      }

      // Verificar se está autenticado
      if (!isAuthenticated || !token) {
        alert('Você precisa estar logado para adicionar itens ao carrinho');
        router.push('/FormLoginRegister');
        return;
      }

      // Verificar estoque
      if (!produto.estoque || produto.estoque <= 0) {
        alert('Produto sem estoque disponível');
        return;
      }

      setAddingItemId(produto.id_produto);

      console.log('Adicionando produto:', produto);

      const success = await addToCart(produto);
      if (success) {
        setAddedProductId(produto.id_produto);
        setTimeout(() => {
          setAddedProductId(null);
        }, 2000);
      }
    } catch (error) {
      alert('Erro ao adicionar ao carrinho');
    } finally {
      setAddingItemId(null);
    }
  };

  const handleLogin = () => {
    router.push('/FormLoginRegister');
  };

  const handleViewDetails = (produtoId) => {
    router.push(`/produto/${produtoId}`);
  };

  if (loadingProducts) {
    return (
      <div className="p-6 text-center min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-100 border border-orange-400 text-orange-700 px-6 py-4 rounded-lg mb-6 max-w-md">
          <strong>Erro!</strong> {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const produtosDisponiveis = produtos.filter(p => p.disponivel !== false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Espaçamento para navbar fixa */}
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Nossos Produtos</h1>
            <p className="text-gray-600 text-lg">
              {produtosDisponiveis.length} produtos disponíveis
            </p>

            {/* Alerta para usuários não logados */}
            {!isAuthenticated && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-yellow-500 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-yellow-800">
                      Faça login para adicionar produtos ao carrinho
                    </p>
                  </div>
                  <button
                    onClick={handleLogin}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {produtosDisponiveis.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Nenhum produto disponível
              </h2>
              <p className="text-gray-500 text-lg">
                Volte em breve para conferir nossos produtos!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {produtosDisponiveis.map((produto) => {
                const isCurrentlyAdding = isAddingItem(produto.id_produto);
                const hasStock = produto.estoque && produto.estoque > 0;

                return (
                  <div
                    key={produto.id_produto}
                    className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Imagem do produto */}
                    <div className="h-56 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      {produto.imagemPath ? (
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}/${produto.imagemPath}`}
                          alt={produto.nome}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="text-gray-400 text-5xl flex items-center justify-center h-full w-full"
                        style={{ display: produto.imagemPath ? 'none' : 'flex' }}
                      >
                        📦
                      </div>

                      {/* Badge de estoque */}
                      {!hasStock && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          Sem Estoque
                        </div>
                      )}
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                        {produto.nome || 'Produto sem nome'}
                      </h2>

                      <div className="mb-5">
                        <p className="text-3xl font-bold text-yellow-600 mb-1">
                          R$ {parseFloat(produto.preco || 0).toFixed(2)}
                        </p>
                        <p className={`text-sm ${hasStock ? 'text-gray-500' : 'text-red-500'}`}>
                          {hasStock
                            ? `${produto.estoque} unidades disponíveis`
                            : 'Produto indisponível'
                          }
                        </p>
                      </div>

                      {/* Botões */}
                      <div className="space-y-3">
                        {/* Botão adicionar ao carrinho */}
                        {isAuthenticated ? (
                          <button
                            data-product-id={produto.id_produto}
                            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${isCurrentlyAdding || !hasStock
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : isAddedItem(produto.id_produto)
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105'
                              }`}
                            onClick={() => handleAddToCart(produto)}
                            disabled={isCurrentlyAdding || !hasStock}
                          >
                            {isCurrentlyAdding ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
                                Adicionando...
                              </div>
                            ) : isAddedItem(produto.id_produto) ? (
                              '✓ Adicionado!'
                            ) : !hasStock ? (
                              'Sem Estoque'
                            ) : (
                              '🛒 Adicionar ao Carrinho'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={handleLogin}
                            className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                          >
                            Fazer Login para Comprar
                          </button>
                        )}

                        {/* Botão ver detalhes */}
                        <button
                          className="w-full px-4 py-3 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                          onClick={() => handleViewDetails(produto.id_produto)}
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}