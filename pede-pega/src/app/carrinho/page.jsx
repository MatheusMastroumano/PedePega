'use client';

import { useCart } from '../components/Cart/contextoCart';
import Link from 'next/link';

function LoadingDots() {
  return (
    <div className="flex items-center gap-2">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-3 h-3 bg-yellow-600 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export default function carrinho() {
  const { cartItems, changeQuantity, removeFromCart, getTotalPrice } = useCart();

  return (
    <div className="min-h-[300px] flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>

      {cartItems.length === 0 ? (
        <>
          <div className="flex items-center justify-center gap-3 text-gray-500 mb-4">
            <p>O carrinho está vazio.</p>
            <LoadingDots />
          </div>
          <Link href="/PaginaCart">
            <p className="text-yellow-600 underline hover:text-yellow-700">
              Ver produtos
            </p>
          </Link>
        </>
      ) : (
        <div className="w-full max-w-3xl space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imagem || item.image}
                  alt={item.nome || item.name}
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h2 className="font-semibold">{item.nome || item.name}</h2>
                  <p className="text-sm text-gray-600">
                    R$ {(item.preco || item.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQuantity(item.id, -1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => changeQuantity(item.id, 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          <div className="text-right mt-4 text-lg font-bold">
            Total: R$ {getTotalPrice().toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}