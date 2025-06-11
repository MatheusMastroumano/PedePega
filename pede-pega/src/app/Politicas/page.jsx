"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Politicas() {
  const [activeSection, setActiveSection] = useState('section1');

  const sections = [
    { id: 'section1', title: '1. Quem Somos' },
    { id: 'section2', title: '2. Dados Coletados' },
    { id: 'section3', title: '3. Finalidade' },
    { id: 'section4', title: '4. Seus Direitos' }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="section"]');
      const scrollY = window.scrollY + 200;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-inner border-b-2 border-yellow-400">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-500 mb-2">
              Política de Privacidade
            </h1>
            <p className="text-gray-600 text-lg">
              Transparência e segurança dos seus dados pessoais
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-8">
          {/* Conteúdo Principal - Alinhado à Esquerda */}
          <div className="flex-1 space-y-20 text-black">
            {/* Section 1 - Imagem Direita */}
            <section id="section1" className="flex flex-col md:flex-row items-start gap-8 scroll-mt-24">
              <div className="md:w-3/5 space-y-4">
                <h2 className="text-3xl font-semibold text-yellow-500 mb-6">
                  1. Quem Somos
                </h2>
                <div className="text-lg leading-relaxed space-y-4">
                  <p>
                    Este sistema foi desenvolvido pelos alunos da{" "}
                    <strong className="text-yellow-600">ETEC Manoel Teodoro</strong> para otimizar o atendimento
                    na cantina operada por <strong className="text-yellow-600">Dona Alice</strong>.
                  </p>
                  <p>
                    Nossa missão é agilizar os pedidos e acabar com as filas nos intervalos,
                    proporcionando uma experiência mais eficiente e agradável para toda a comunidade escolar.
                  </p>
                </div>
              </div>
              <div className="md:w-2/5 flex justify-center">
                <Image
                  src="/img/team.svg"
                  width={280}
                  height={280}
                  alt="Equipe"
                  className="drop-shadow-lg"
                />
              </div>
            </section>

            {/* Section 2 - Imagem Esquerda */}
            <section id="section2" className="flex flex-col md:flex-row-reverse items-start gap-8 scroll-mt-24">
              <div className="md:w-3/5 space-y-4">
                <h2 className="text-3xl font-semibold text-yellow-500 mb-6">
                  2. Dados Coletados
                </h2>
                <div className="text-lg leading-relaxed">
                  <p className="mb-4">Para proporcionar o melhor serviço, coletamos:</p>
                  <ul className="list-disc pl-6 space-y-3 text-gray-700">
                    <li><strong>Dados pessoais:</strong> Nome, CPF, matrícula, série e turno</li>
                    <li><strong>Dados de pedidos:</strong> Itens solicitados e horário de retirada</li>
                    <li><strong>Dados de uso:</strong> Informações de acesso para melhorias da plataforma</li>
                  </ul>
                </div>
              </div>
              <div className="md:w-2/5 flex justify-center">
                <Image
                  src="/img/privacy.svg"
                  width={280}
                  height={280}
                  alt="Dados Coletados"
                  className="drop-shadow-lg"
                />
              </div>
            </section>

            {/* Section 3 - Imagem Direita */}
            <section id="section3" className="flex flex-col md:flex-row items-start gap-8 scroll-mt-24">
              <div className="md:w-3/5 space-y-4">
                <h2 className="text-3xl font-semibold text-yellow-500 mb-6">
                  3. Finalidade
                </h2>
                <div className="text-lg leading-relaxed space-y-4">
                  <p>
                    Utilizamos os dados coletados exclusivamente para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Organizar e processar os pedidos da cantina</li>
                    <li>Otimizar os horários de retirada</li>
                    <li>Melhorar a experiência de todos os usuários</li>
                    <li>Auxiliar a equipe da cantina na gestão eficiente</li>
                  </ul>
                </div>
              </div>
              <div className="md:w-2/5 flex justify-center">
                <Image
                  src="/img/productivity.svg"
                  width={280}
                  height={280}
                  alt="Finalidade"
                  className="drop-shadow-lg"
                />
              </div>
            </section>

            {/* Section 4 - Imagem Esquerda */}
            <section id="section4" className="flex flex-col md:flex-row-reverse items-start gap-8 scroll-mt-24">
              <div className="md:w-3/5 space-y-4">
                <h2 className="text-3xl font-semibold text-yellow-500 mb-6">
                  4. Seus Direitos
                </h2>
                <div className="text-lg leading-relaxed space-y-4">
                  <p>
                    Você possui total controle sobre seus dados pessoais e pode:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Acessar seus dados a qualquer momento</li>
                    <li>Solicitar correções quando necessário</li>
                    <li>Excluir suas informações do sistema</li>
                    <li>Receber uma cópia dos seus dados</li>
                  </ul>
                  <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                    <strong>Como exercer seus direitos:</strong> Procure a gestão escolar 
                    para realizar qualquer solicitação sobre seus dados pessoais.
                  </p>
                </div>
              </div>
              <div className="md:w-2/5 flex justify-center">
                <Image
                  src="/img/security.svg"
                  width={280}
                  height={280}
                  alt="Seus Direitos"
                  className="drop-shadow-lg"
                />
              </div>
            </section>
          </div>

          {/* Índice Lateral - Fixo à Direita */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Índice de Conteúdo
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                        activeSection === section.id
                          ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-yellow-600'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-500 text-center">
                    <p className="mb-2">Desenvolvido por</p>
                    <p className="font-semibold text-yellow-600">ETEC Manoel Teodoro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}