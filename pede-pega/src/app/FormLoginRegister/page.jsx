'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', senha: '' });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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
    setLoading(true);

    // CORRIGIDO: endpoints baseados nas suas rotas da API
    const endpoint = isLogin ? 'auth/login' : 'auth/register';
    const body = isLogin
      ? { email: form.email, senha: form.senha }
      : { name: form.name, email: form.email, senha: form.senha };

    try {
      console.log(`Fazendo requisição para: http://localhost:3001/api/${endpoint}`);
      console.log('Dados enviados:', body);

      const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('Status da resposta:', response.status);

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (response.ok) {
        // CORRIGIDO: usar chave consistente para localStorage
        localStorage.setItem('authToken', data.token);
        
        // CORRIGIDO: passar dados do usuário se disponível
        login(data.token, data.user || data.usuario || null);
        
        console.log('Login realizado com sucesso');
        router.push('/PaginaCart');
      } else {
        // MELHORADO: tratamento de erros mais robusto
        const errorMessage = data.mensagem || data.message || data.error || 'Erro desconhecido';
        console.error('Erro da API:', errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro na conexão com o servidor. Verifique se a API está funcionando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
            disabled={loading}
            className={`w-full font-semibold py-2 rounded transition-all duration-200 ${
              loading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                {isLogin ? 'Entrando...' : 'Registrando...'}
              </div>
            ) : (
              <>
                {isLogin ? 'Entrar' : 'Registrar'}
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            onClick={toggleMode}
            disabled={loading}
            className="text-blue-600 hover:underline font-medium disabled:opacity-50"
          >
            {isLogin ? 'Registrar' : 'Entrar'}
          </button>
        </p>

        {/* DEBUG INFO - remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong><br/>
            Endpoint: {isLogin ? 'auth/login' : 'auth/register'}<br/>
            URL: http://localhost:3001/api/{isLogin ? 'auth/login' : 'auth/register'}
          </div>
        )}
      </div>
    </div>
  );
}