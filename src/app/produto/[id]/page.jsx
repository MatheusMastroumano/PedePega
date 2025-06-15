'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProdutoDetalhesPage({ params }) {
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/produtos/${params.id}`);
        if (!response.ok) {
          throw new Error('Produto não encontrado');
        }
        const data = await response.json();
        setProduto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado</h2>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push('/PaginaProdutos')}
          className="mb-8 text-yellow-600 hover:text-yellow-700 flex items-center gap-2"
        >
          ← Voltar para Produtos
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Imagem do produto */}
            <div className="md:w-1/2">
              <img
                src={`https://source.unsplash.com/600x400/?${encodeURIComponent(produto.nome)}`}
                alt={produto.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://source.unsplash.com/600x400/?food';
                }}
              />
            </div>

            {/* Informações do produto */}
            <div className="p-8 md:w-1/2">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{produto.nome}</h1>
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-yellow-600 mb-2">
                  R$ {parseFloat(produto.preco).toFixed(2)}
                </p>
                <p className="text-gray-600">
                  {produto.estoque > 0 ? (
                    <span className="text-green-600">Em estoque: {produto.estoque} unidades</span>
                  ) : (
                    <span className="text-red-600">Produto indisponível</span>
                  )}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Descrição</h2>
                <p className="text-gray-600">
                  {produto.descricao || 'Este é um produto delicioso e de alta qualidade, preparado com ingredientes selecionados para garantir a melhor experiência gastronômica.'}
                </p>
              </div>

              <button
                onClick={() => router.push('/PaginaProdutos')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Voltar para Produtos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 