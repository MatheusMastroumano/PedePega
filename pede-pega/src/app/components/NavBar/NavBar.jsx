'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../Cart/contextoCart.js';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContexto/ContextoAuth.js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalPrice, getTotalItems, fetchCartFromAPI } = useCart();
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Valores do carrinho
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Buscar carrinho quando a navbar é carregada e há token
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    }
  }, [token]);

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

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
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
            <button 
              onClick={() => router.push('/')}
              className="text-[25px] font-medium no-underline text-black hover:text-yellow-600 transition-colors"
            >
              Pede<span className="text-yellow-600">&amp;</span>Pega
            </button>
          </div>

          {/* Carrinho e menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/carrinho')}
              className="flex items-center gap-2 text-black font-semibold hover:text-yellow-600 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:block">
                R$ {totalPrice.toFixed(2)}
              </span>
            </button>

            <button
              className="focus:outline-none menu-toggle text-black hover:text-yellow-600 transition-colors"
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
              <X size={24} className="text-black hover:text-yellow-600 transition-colors" />
            </button>
          </div>
          
          {/* Saudação do usuário */}
          {token && user && (
            <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 rounded-full p-2">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bem-vindo!</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {user.name || 'Usuário'}
                  </p>
                  {user.turma && user.turno && (
                    <p className="text-xs text-gray-500">
                      {user.turma} - {user.turno}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Informações do carrinho no menu */}
          {token && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Carrinho:</span>
                <span className="font-semibold">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <div className="text-lg font-bold text-yellow-600">
                R$ {totalPrice.toFixed(2)}
              </div>
            </div>
          )}
          
          <ul className="px-6 py-4 space-y-4">
            <li
              className="text-lg text-black cursor-pointer hover:text-yellow-600 transition-colors"
              onClick={() => handleNavigation('/')}
            >
              Início
            </li>
            <li
              className="text-lg text-black cursor-pointer hover:text-yellow-600 transition-colors"
              onClick={() => handleNavigation('../../PaginaCart')}
            >
              Produtos
            </li>
            {token && (
              <li
                className="text-lg text-black cursor-pointer hover:text-yellow-600 transition-colors"
                onClick={() => handleNavigation('../../carrinho')}
              >
                Carrinho
              </li>
            )}
            {token ? (
              <li
                className="text-lg text-red-600 cursor-pointer hover:text-red-700 transition-colors"
                onClick={handleLogout}
              >
                Sair
              </li>
            ) : (
              <li
                className="text-lg text-black cursor-pointer hover:text-yellow-600 transition-colors"
                onClick={() => handleNavigation('/FormLoginRegister')}
              >
                Entrar
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}