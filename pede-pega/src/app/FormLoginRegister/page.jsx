'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserCheck, Clock, GraduationCap } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    cpf: '', 
    turma: '', 
    turno: '', 
    senha: '' 
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Validações baseadas no controller
  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validarCPF = (cpf) => {
    if (!cpf || typeof cpf !== 'string') {
      return false;
    }
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  };

  const formatarCPF = (value) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const validarCampos = () => {
    const newErrors = {};

    // Validações para registro
    if (!isLogin) {
      // Nome obrigatório
      if (!form.name || !form.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      }

      // CPF obrigatório e válido
      if (!form.cpf || !form.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (!validarCPF(form.cpf)) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }

      // Turma obrigatória
      if (!form.turma || !form.turma.trim()) {
        newErrors.turma = 'Turma é obrigatória';
      }

      // Turno obrigatório
      if (!form.turno || !form.turno.trim()) {
        newErrors.turno = 'Turno é obrigatório';
      }
    }

    if (!form.email || !form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validarEmail(form.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Formatação especial para CPF
    if (name === 'cpf') {
      processedValue = formatarCPF(value);
    }

    setForm((prev) => ({ ...prev, [name]: processedValue }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Calcular força da senha
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
    setForm({ name: '', email: '', cpf: '', turma: '', turno: '', senha: '' });
    setErrors({});
    setPasswordStrength('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos antes de enviar
    if (!validarCampos()) {
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? 'auth/login' : 'auth/register';
    const body = isLogin
      ? { 
          email: form.email.toLowerCase().trim(), 
          senha: form.senha 
        }
      : { 
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          cpf: form.cpf.replace(/\D/g, ''), // Remover formatação do CPF
          turma: form.turma.trim(),
          turno: form.turno.trim(),
          senha: form.senha
        };

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
        localStorage.setItem('authToken', data.token);
        login(data.token, data.user || data.usuario || null);
        
        console.log('Login realizado com sucesso');
        router.push('/PaginaCart');
      } else {
        // Tratar erros específicos do servidor
        if (data.erro) {
          if (data.erro.includes('Email já cadastrado')) {
            setErrors({ email: 'Este email já está cadastrado' });
          } else if (data.erro.includes('CPF já cadastrado')) {
            setErrors({ cpf: 'Este CPF já está cadastrado' });
          } else if (data.erro.includes('Email ou senha incorretos')) {
            setErrors({ email: 'Email ou senha incorretos', senha: 'Email ou senha incorretos' });
          } else {
            alert(data.erro);
          }
        } else {
          const errorMessage = data.mensagem || data.message || data.error || 'Erro desconhecido';
          alert(errorMessage);
        }
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
            <>
              {/* Campo Nome */}
              <div className="relative">
                <label className="block mb-1 font-medium">Nome</label>
                <div className={`flex items-center border rounded p-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <User size={20} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full outline-none"
                    placeholder="Digite seu nome completo"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Campo CPF */}
              <div className="relative">
                <label className="block mb-1 font-medium">CPF</label>
                <div className={`flex items-center border rounded p-2 ${
                  errors.cpf ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <UserCheck size={20} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    className="w-full outline-none"
                    placeholder="000.000.000-00"
                    maxLength="14"
                    disabled={loading}
                  />
                </div>
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                )}
              </div>

              {/* Campo Turma */}
              <div className="relative">
                <label className="block mb-1 font-medium">Turma</label>
                <div className={`flex items-center border rounded p-2 ${
                  errors.turma ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <GraduationCap size={20} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="turma"
                    value={form.turma}
                    onChange={handleChange}
                    className="w-full outline-none"
                    placeholder="Ex: 3º Ano A"
                    disabled={loading}
                  />
                </div>
                {errors.turma && (
                  <p className="text-red-500 text-sm mt-1">{errors.turma}</p>
                )}
              </div>

              {/* Campo Turno */}
              <div className="relative">
                <label className="block mb-1 font-medium">Turno</label>
                <div className={`flex items-center border rounded p-2 ${
                  errors.turno ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <Clock size={20} className="text-gray-400 mr-2" />
                  <select
                    name="turno"
                    value={form.turno}
                    onChange={handleChange}
                    className="w-full outline-none bg-transparent"
                    disabled={loading}
                  >
                    <option value="">Selecione o turno</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
                {errors.turno && (
                  <p className="text-red-500 text-sm mt-1">{errors.turno}</p>
                )}
              </div>
            </>
          )}

          {/* Campo Email */}
          <div className="relative">
            <label className="block mb-1 font-medium">Email</label>
            <div className={`flex items-center border rounded p-2 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Mail size={20} className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full outline-none"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="relative">
            <label className="block mb-1 font-medium">Senha</label>
            <div className={`flex items-center border rounded p-2 ${
              errors.senha ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Lock size={20} className="text-gray-400 mr-2" />
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full outline-none"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}
            {!isLogin && form.senha && (
              <p
                className={`text-sm mt-1 font-medium ${
                  passwordStrength === 'forte'
                    ? 'text-green-600'
                    : passwordStrength === 'média'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                Força da senha: {passwordStrength}
                {passwordStrength === 'fraca' && ' (Use números, letras e símbolos)'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded transition-all duration-200 ${
              loading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:shadow-lg'
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

        <p className="text-center mt-6">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            onClick={toggleMode}
            disabled={loading}
            className="text-blue-600 hover:underline font-medium disabled:opacity-50"
          >
            {isLogin ? 'Registrar' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}