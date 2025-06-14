'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserCheck, Clock, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../components/AuthContexto/ContextoAuth.js';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', cpf: '', turma: '', turno: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, loginAsAdmin } = useAuth();

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarCPF = (cpf) => cpf?.replace(/\D/g, '').length === 11;

  const formatarCPF = (value) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const validarCampos = () => {
    const newErrors = {};

    if (activeTab === 'register') {
      if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!form.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      else if (!validarCPF(form.cpf)) newErrors.cpf = 'CPF inválido';
      if (!form.turma.trim()) newErrors.turma = 'Turma é obrigatória';
      if (!form.turno.trim()) newErrors.turno = 'Turno é obrigatório';
    }

    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!validarEmail(form.email)) newErrors.email = 'Email inválido';

    if (!form.senha.trim()) newErrors.senha = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'cpf' ? formatarCPF(value) : value;

    setForm((prev) => ({ ...prev, [name]: processedValue }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

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

  const switchTab = (tab) => {
    setActiveTab(tab);
    setForm({ name: '', email: '', cpf: '', turma: '', turno: '', senha: '' });
    setErrors({});
    setPasswordStrength('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    setLoading(true);

    let endpoint, body;
    if (activeTab === 'register') {
      endpoint = 'auth/register';
      body = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        turma: form.turma.trim(),
        turno: form.turno.trim(),
        senha: form.senha,
      };
    } else {
      endpoint = 'auth/login';
      body = {
        email: form.email.toLowerCase().trim(),
        senha: form.senha,
      };
    }

    try {
      const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // Usar loginAsAdmin para login de admin
        if (activeTab === 'admin') {
          const result = await loginAsAdmin(data.token, data.user || data.usuario || null);
          
          if (result.success) {
            router.push('/admin');
          } else {
            setErrors({
              email: result.error || 'Erro ao verificar privilégios de administrador',
              senha: result.error || 'Erro ao verificar privilégios de administrador',
            });
          }
        } else {
          // Login normal para usuários comuns
          const result = await login(data.token, data.user || data.usuario || null);
          
          if (result.success) {
            if (activeTab === 'register') {
              router.push('/PaginaProdutos');
            } else {
              router.push('/PaginaProdutos');
            }
          } else {
            setErrors({
              email: result.error || 'Erro ao fazer login',
              senha: result.error || 'Erro ao fazer login',
            });
          }
        }
      } else {
        if (data.erro) {
          if (data.erro.includes('Email já cadastrado')) {
            setErrors({ email: 'Este email já está cadastrado' });
          } else if (data.erro.includes('CPF já cadastrado')) {
            setErrors({ cpf: 'Este CPF já está cadastrado' });
          } else if (data.erro.includes('Email ou senha incorretos')) {
            const msg = activeTab === 'admin'
              ? 'Email, senha incorretos ou usuário não é administrador'
              : 'Email ou senha incorretos';
            setErrors({ email: msg, senha: msg });
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
        
        {/* Tabs de navegação */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Registrar
          </button>
          <button
            onClick={() => switchTab('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Título dinâmico */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            {activeTab === 'admin' && <Shield className="text-red-600 mr-2" size={24} />}
            <h1 className="text-3xl font-bold">
              {activeTab === 'login' && 'Entrar na conta'}
              {activeTab === 'register' && 'Criar conta'}
              {activeTab === 'admin' && 'Acesso Admin'}
            </h1>
          </div>
          {activeTab === 'admin' && (
            <p className="text-sm text-red-600 font-medium">
              Área restrita para administradores
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
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
            <label className="block mb-1 font-medium">
              {activeTab === 'admin' ? 'Email do Administrador' : 'Email'}
            </label>
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
                placeholder={activeTab === 'admin' ? 'admin@exemplo.com' : 'seu@email.com'}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="relative">
            <label className="block mb-1 font-medium">
              {activeTab === 'admin' ? 'Senha do Administrador' : 'Senha'}
            </label>
            <div className={`flex items-center border rounded p-2 ${
              errors.senha ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Lock size={20} className="text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full outline-none"
                placeholder={activeTab === 'register' ? 'Mínimo 8 caracteres' : 'Sua senha'}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 ml-1"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}
            {activeTab === 'register' && form.senha && (
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
                : activeTab === 'admin'
                ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                {activeTab === 'register' ? 'Registrando...' : 'Entrando...'}
              </div>
            ) : (
              <>
                {activeTab === 'login' && 'Entrar'}
                {activeTab === 'register' && 'Registrar'}
                {activeTab === 'admin' && (
                  <div className="flex items-center justify-center">
                    <Shield size={20} className="mr-2" />
                    Acessar Admin
                  </div>
                )}
              </>
            )}
          </button>
        </form>

        {/* Aviso adicional para admin */}
        {activeTab === 'admin' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              <strong>Atenção:</strong> Esta área é restrita apenas para usuários com privilégios de administrador. 
              Será verificado automaticamente se você possui as permissões necessárias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}