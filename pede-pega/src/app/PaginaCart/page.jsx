'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../components/Cart/contextoCart';
import { useRouter } from 'next/navigation';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { addToCart, loading: cartLoading, isAuthenticated, isAddingItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await fetch('http://localhost:3001/produtos');
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const data = await res.json();
        setProdutos(data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        alert('Erro ao carregar produtos');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProdutos();
  }, []);

  const handleAddToCart = async (produto) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para adicionar itens ao carrinho');
      router.push('/FormLoginRegister'); // Redireciona para login
      return;
    }

    // Verifica se há estoque
    if (!produto.estoque || produto.estoque <= 0) {
      alert('Produto sem estoque disponível');
      return;
    }

    await addToCart(produto);
  };

  if (loadingProducts) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-2">Carregando produtos...</p>
      </div>
    );
  }

  const produtosDisponiveis = produtos.filter(p => p.disponivel);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nossos Produtos</h1>
        <p className="text-gray-600">
          {produtosDisponiveis.length} produtos disponíveis
        </p>
      </div>

      {produtosDisponiveis.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl text-gray-500">Nenhum produto disponível no momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtosDisponiveis.map((produto) => {
            const isCurrentlyAdding = isAddingItem(produto.id_produto);
            const hasStock = produto.estoque && produto.estoque > 0;
            
            return (
              <div
                key={produto.id_produto}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Imagem do produto */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {produto.imagemPath ? (
                    <img 
                      src={produto.imagemPath} 
                      alt={produto.nome} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">📦</div>
                  )}
                </div>

                {/* Conteúdo do card */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {produto.nome}
                  </h2>
                  
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-yellow-600">
                      R$ {parseFloat(produto.preco).toFixed(2)}
                    </p>
                    <p className={`text-sm ${hasStock ? 'text-gray-500' : 'text-red-500'}`}>
                      {hasStock 
                        ? `Estoque: ${produto.estoque} unidades`
                        : 'Produto indisponível'
                      }
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="space-y-2">
                    <button
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCurrentlyAdding || !hasStock
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                      onClick={() => handleAddToCart(produto)}
                      disabled={isCurrentlyAdding || !hasStock}
                    >
                      {isCurrentlyAdding ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                          Adicionando...
                        </div>
                      ) : !hasStock ? (
                        'Sem Estoque'
                      ) : (
                        'Adicionar ao Carrinho'
                      )}
                    </button>

                    <button
                      className="w-full px-4 py-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 rounded-lg font-medium transition-colors"
                      onClick={() => router.push(`/produto/${produto.id_produto}`)}
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
  );
}