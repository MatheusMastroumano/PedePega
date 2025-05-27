'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../Cart/contextoCart.js';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalPrice } = useCart();
  const router = useRouter();
  const totalPrice = getTotalPrice();

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se há token JWT salvo
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/"); // Redireciona para a home
  };

  // Esconder/mostrar a navbar com base no scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isOpen &&
        !event.target.closest('.menu-panel') &&
        !event.target.closest('.menu-toggle')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Navegar com fechamento de menu
  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-200 ${showNavbar ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="flex items-center justify-between px-4 py-3 relative">
          {/* Logo à esquerda */}
          <div className="flex items-center gap-2">
            <img src="/img/Logo.svg" alt="Logo" className="h-[40px]" />
          </div>

          {/* Nome centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a href="#" className="text-[25px] font-medium no-underline text-black">
              Pede<span className="text-yellow-600">&amp;</span>Pega
            </a>
          </div>

          {/* Carrinho e menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/carrinho')}
              className="flex items-center gap-2 text-black font-semibold hover:underline"
            >
              <ShoppingCart size={24} />
              R$ {totalPrice.toFixed(2)}
            </button>

            <button
              className="focus:outline-none menu-toggle text-black"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Quando o menu estiver aberto, aplicar fundo com blur atrás do painel lateral */}
      <div className="relative z-40">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Painel lateral deslizante */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out menu-panel z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} aria-label="Fechar menu">
              <X size={24} className="text-black" />
            </button>
          </div>
          <ul className="px-6 py-4 space-y-4">
            <li
              className="text-lg text-black cursor-pointer hover:underline"
              onClick={() => handleNavigation('/')}
            >
              Início
            </li>
            <li
              className="text-lg text-black cursor-pointer hover:underline"
              onClick={() => handleNavigation('/PaginaCart')}
            >
              Produtos
            </li>
            <li
              className="text-lg text-black cursor-pointer hover:underline"
              onClick={() => {
                if (isAuthenticated) {
                  handleLogout();
                } else {
                  handleNavigation("/FormLoginRegister");
                }
              }}
            >
              {isAuthenticated ? "Sair" : "Entrar"}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
