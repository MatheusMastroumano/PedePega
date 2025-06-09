"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaUsers, FaUniversalAccess, FaLeaf, FaBook } from 'react-icons/fa';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

// Variantes para animações mais suaves
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.2 },
  }),
};

export default function PageSobre() {
  const { user, isAuthenticated } = useAuth();

  // Dados dos ideais
  const ideals = [
    {
      icon: <FaLightbulb aria-hidden="true" />,
      title: 'Inovação',
      description: 'Utilizamos tecnologia para resolver problemas do dia a dia, trazendo eficiência e praticidade.',
    },
    {
      icon: <FaUsers aria-hidden="true" />,
      title: 'Comunidade',
      description: 'Promovemos a colaboração entre alunos, professores e funcionários para criar soluções coletivas.',
    },
    {
      icon: <FaUniversalAccess aria-hidden="true" />,
      title: 'Acessibilidade',
      description: 'Garantimos um sistema simples e acessível para todos os usuários.',
    },
    {
      icon: <FaLeaf aria-hidden="true" />,
      title: 'Sustentabilidade',
      description: 'Reduzimos desperdício de tempo e recursos, otimizando os processos da cantina.',
    },
    {
      icon: <FaBook aria-hidden="true" />,
      title: 'Educação',
      description: 'Fomentamos o aprendizado prático e o desenvolvimento de habilidades tecnológicas.',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mensagem personalizada para usuário autenticado */}
      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-lg font-medium" style={{ color: 'var(--laranja)' }}>
            Bem-vindo, {user.name || 'Usuário'}! Conheça mais sobre o Pede&Pega.
          </p>
        </motion.div>
      )}

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-12 bg-white rounded-xl shadow-lg p-6 sm:p-8"
        role="region"
        aria-labelledby="historia-title"
      >
        <h2
          id="historia-title"
          className="text-2xl sm:text-3xl font-semibold mb-6 text-center"
          style={{ color: 'var(--laranja)' }}
        >
          Nossa História
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700">
          Tudo começou na ETEC Manoel Teodoro, onde a cantina, comandada pela querida Dona Alice, enfrentava um grande desafio: atender a alta demanda durante os recreios. Alunos perdiam seus intervalos nas longas filas, e a solução veio da gestora pedagógica, Profa. Ivete Borges. Ela propôs um projeto inovador: informatizar os pedidos da cantina. Os alunos do curso técnico abraçaram a ideia como parte de um projeto integrador, desenvolvendo o sistema digital Pede&Pega, que permite pedidos antecipados, organização por horário e maior eficiência. Assim nasceu nossa iniciativa, transformando a experiência da cantina com tecnologia e colaboração!
        </p>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
        role="region"
        aria-labelledby="ideais-title"
      >
        <h2
          id="ideais-title"
          className="text-2xl sm:text-3xl font-semibold mb-8 text-center"
          style={{ color: 'var(--laranja)' }}
        >
          Nossos Ideais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideals.map((ideal, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-100 rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--amarelo)' }}
              role="article"
            >
              <div
                className="text-4xl mb-4"
                style={{ color: 'var(--vermelho)' }}
                aria-hidden="true"
              >
                {ideal.icon}
              </div>
              <h3
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: 'var(--laranja)' }}
              >
                {ideal.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">{ideal.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-12 rounded-xl p-6 sm:p-8 text-center"
        style={{
          background: 'linear-gradient(to right, var(--laranja), var(--vermelho))',
          color: 'var(--foreground)',
        }}
        role="region"
        aria-labelledby="missao-title"
      >
        <h2
          id="missao-title"
          className="text-2xl sm:text-3xl font-semibold mb-4"
        >
          Nossa Missão
        </h2>
        <p className="text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          Transformar a experiência na cantina da ETEC Manoel Teodoro, oferecendo um sistema digital que agiliza pedidos, reduz filas e dá mais tempo para os alunos aproveitarem seus intervalos. Queremos inspirar outros projetos que unam tecnologia e inovação para resolver desafios do cotidiano escolar.
        </p>
        <a
          href="/PaginaProdutos"
          className="mt-6 inline-block font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: 'var(--amarelo)',
            color: 'var(--preto)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--laranja)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--amarelo)')}
          aria-label="Ver os produtos disponíveis"
        >
          Veja os Produtos
        </a>
      </motion.section>
    </main>
  );
}