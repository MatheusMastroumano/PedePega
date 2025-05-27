'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', senha: '' });
  const [passwordStrength, setPasswordStrength] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'senha') {
      const strength = getPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrength = (senha) => {
    if (senha.length < 6) return 'fraca';
    if (/\d/.test(senha) && /[a-z]/i.test(senha) && /[@$!%*?&#]/.test(senha)) return 'forte';
    return 'média';
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', senha: '' });
    setPasswordStrength('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin
      ? { email: form.email, senha: form.senha }
      : { name: form.name, email: form.email, senha: form.senha };

    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        router.push('/PaginaCart');
      } else {
        alert(data.mensagem || 'Erro');
      }
    } catch (error) {
      alert('Erro na requisição');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 animate-fade-in">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-black transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Entrar na conta' : 'Criar conta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <label className="block mb-1">Nome</label>
              <div className="flex items-center border border-gray-300 rounded p-2">
                <User size={20} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="relative">
            <label className="block mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded p-2">
              <Mail size={20} className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block mb-1">Senha</label>
            <div className="flex items-center border border-gray-300 rounded p-2">
              <Lock size={20} className="text-gray-400 mr-2" />
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
            {!isLogin && (
              <p
                className={`text-sm mt-1 font-medium ${
                  passwordStrength === 'forte'
                    ? 'text-green-600'
                    : passwordStrength === 'média'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                Força da senha: {passwordStrength || '...'}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition-all duration-200"
          >
            {isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? 'Registrar' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}
