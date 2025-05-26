'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../components/Cart/contextoCart';
import { useRouter } from 'next/navigation';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:3001/produtos')
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error('Erro ao buscar produtos:', err));
  }, []);

  return (
    <div className="p-6 flex flex-wrap justify-center gap-6">
      {produtos.map((produto) => (
        <div
          key={produto.id}
          className="bg-white shadow-md rounded-xl w-64 p-4 flex flex-col items-center text-center"
        >
          <img src={produto.imagem} alt={produto.nome} className="h-32 object-contain mb-2" />
          <h2 className="text-lg font-semibold text-black">{produto.nome}</h2>
          <p className="text-yellow-600 font-bold text-lg">R$ {produto.preco.toFixed(2)}</p>

          {/* Botão Adicionar ao Carrinho */}
          <button
            className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg w-full"
            onClick={() => addToCart(produto)}
          >
            Adicionar ao Carrinho
          </button>

          {/* Botão Ver Detalhes (outline) */}
          <button
            className="mt-2 px-4 py-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-100 rounded-lg w-full"
            onClick={() => router.push(`/produto/${produto.id}`)}
          >
            Ver Detalhes
          </button>
        </div>
      ))}
    </div>
  );
}
