'use client'

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && !event.target.closest(".menu-panel") && !event.target.closest(".menu-toggle")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-md relative z-50">
      {/* Logo placeholder */}
      <div><img src="/img/Logo.svg" className=" h-[40px]" /></div>

      {/* Center clickable text */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <a href="#" className="text-[25px] font-medium no-underline text-black">
          Pede<span className="text-yellow-600">&amp;</span>Pega
        </a>
      </div>

      {/* Hamburger icon (always visible) */}
      <button
        className="focus:outline-none menu-toggle text-black"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Background overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity" />
      )}

      {/* Slide-in menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 menu-panel ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} aria-label="Close menu">
            <X size={24} className="text-black"/>
          </button>
        </div>
        <ul className="px-6 py-4 space-y-4">
          {/* Itens do menu personalizados vão aqui */}
          <li className="text-lg text-black">Item 1</li>
          <li className="text-lg text-black">Item 2</li>
          <li className="text-lg text-black">Item 3</li>
        </ul>
      </div>
    </nav>
  );
}
