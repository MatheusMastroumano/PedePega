"use client";
import { useCart } from "../Cart/contextoCart.js";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-[250px] text-center">
      <img src={product.image} className="w-full h-40 object-cover rounded" />
      <h2 className="font-bold mt-2">{product.name}</h2>
      <p className="text-gray-700 mb-2">R$ {product.price.toFixed(2)}</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => addToCart(product)}
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}