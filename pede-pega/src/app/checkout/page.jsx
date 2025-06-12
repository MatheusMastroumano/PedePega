"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../components/Cart/contextoCart.js";
import { useAuth } from "../components/AuthContexto/ContextoAuth.js";
import { useRouter } from 'next/navigation';
import { ShoppingBag, AlertTriangle, CheckCircle, CreditCard, User, MapPin, Clock } from 'lucide-react';
import { maskPhone, maskCardNumber, maskCardExpiry, maskCVV, removeMask } from "@/utils/masks";

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  itemImage: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
    marginRight: "15px",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    color: "#666",
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "2px solid #eee",
  },
  totalText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2ecc71",
  },
  button: {
    backgroundColor: "#2ecc71",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    width: "100%",
    marginTop: "20px",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  error: {
    color: "#e74c3c",
    marginTop: "10px",
    textAlign: "center",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  },
  horarioItem: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  horarioItemHover: {
    borderColor: "#2ecc71",
    backgroundColor: "#f8f9fa",
  },
  horarioItemSelecionado: {
    borderColor: "#2ecc71",
    backgroundColor: "#e8f8f0",
  },
  horarioItemIndisponivel: {
    opacity: 0.6,
    cursor: "not-allowed",
    backgroundColor: "#f8f9fa",
  },
  horarioInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horarioTexto: {
    fontWeight: "500",
    color: "#333",
  },
  disponibilidade: {
    fontSize: "0.9em",
    color: "#666",
  },
};

export default function Checkout() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { cartItems, total, fetchCartFromAPI } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    dataEntrega: "",
    turno: "",
    horario: "",
    formaPagamento: "dinheiro",
    numeroCartao: "",
    nomeCartao: "",
    validadeCartao: "",
    cvvCartao: "",
  });

  const API_URL = 'http://localhost:3001/api';

  // Recarrega o carrinho quando a página é acessada
  useEffect(() => {
    const initializePage = async () => {
      try {
        if (token) {
          await fetchCartFromAPI();
        }
      } catch (error) {
        console.error('Erro ao inicializar página:', error);
        setError('Erro ao carregar dados do pedido');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || '',
        telefone: user.telefone || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras específicas para cada campo
    switch (name) {
      case 'telefone':
        formattedValue = maskPhone(value);
        break;
      case 'numeroCartao':
        formattedValue = maskCardNumber(value);
        break;
      case 'validadeCartao':
        formattedValue = maskCardExpiry(value);
        break;
      case 'cvvCartao':
        formattedValue = maskCVV(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validarCartao = () => {
    if (formData.formaPagamento === '') return false;
    if (formData.formaPagamento === 'dinheiro') return true;
    
    return formData.numeroCartao && formData.nomeCartao && formData.validadeCartao && formData.cvvCartao;
  };

  const finalizarPedido = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.dataEntrega) {
        throw new Error('Por favor, selecione uma data de entrega');
      }

      if (!formData.horario) {
        throw new Error('Por favor, selecione um horário de retirada');
      }

      if (!formData.formaPagamento) {
        throw new Error('Por favor, selecione uma forma de pagamento');
      }

      if ((formData.formaPagamento === 'debito' || formData.formaPagamento === 'credito') && !validarCartao()) {
        throw new Error('Por favor, preencha corretamente os dados do cartão');
      }

      // Formatar o horário para HH:mm
      const horarioFormatado = formData.horario.split(':').slice(0, 2).join(':');

      const response = await fetch(`${API_URL}/pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dataRetirada: formData.dataEntrega,
          horarioRetirada: horarioFormatado,
          formaPagamento: formData.formaPagamento,
          dadosCartao: formData.formaPagamento === 'debito' || formData.formaPagamento === 'credito' ? {
            numero: removeMask(formData.numeroCartao),
            numero: formData.numeroCartao,
            nome: formData.nomeCartao,
            validade: formData.validadeCartao,
            cvv: formData.cvvCartao
          } : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao finalizar pedido');
      }

      const data = await response.json();
      console.log('Pedido finalizado com sucesso:', data);

      // Limpar carrinho e redirecionar
      await fetchCartFromAPI();
      router.push('/pedidos');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se há problemas de estoque
  const itemsComProblemaEstoque = cartItems?.filter(item => 
    !item.estoque || item.estoque < item.quantidade
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Carrinho Vazio</h2>
          <p className="mt-2 text-gray-600">Adicione itens ao seu carrinho para continuar</p>
          <button
            onClick={() => router.push('/PaginaProdutos')}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/carrinho')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Voltar ao Carrinho
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Finalize seu pedido</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo do Pedido</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`cart-item-${item.id}`} className="flex items-center py-3 border-b border-gray-100">
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-gray-800 font-medium">{item.nome}</h3>
                      <p className="text-gray-600">Quantidade: {item.quantidade}</p>
                      <p className="text-gray-800 font-medium">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-yellow-500">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações de Entrega */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações de Entrega</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-800 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Data e Horário de Retirada */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data e Horário de Retirada</h2>
              
              {/* Seletor de Data */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Data de Entrega
                </label>
                <input
                  type="date"
                  value={formData.dataEntrega}
                  onChange={(e) => setFormData({ ...formData, dataEntrega: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              
              {/* Seletor de Turno */}
              <div className="mb-6">
                <label className="block text-black mb-2">Turno</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                  required
                >
                  <option value="">Selecione o turno</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              {/* Seletor de Horário */}
              <div className="mb-6">
                <label className="block text-black mb-2">Horário</label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Forma de Pagamento</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, formaPagamento: 'debito' })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.formaPagamento === 'debito'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-medium">Débito</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFormData({ ...formData, formaPagamento: 'credito' })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.formaPagamento === 'credito'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-medium">Crédito</span>
                  </div>
                </button>
              </div>

              {/* Campos do Cartão */}
              {(formData.formaPagamento === 'debito' || formData.formaPagamento === 'credito') && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={formData.numeroCartao}
                      onChange={(e) => setFormData({ ...formData, numeroCartao: e.target.value })}
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={formData.nomeCartao}
                      onChange={(e) => setFormData({ ...formData, nomeCartao: e.target.value })}
                      placeholder="Nome como está no cartão"
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        value={formData.validadeCartao}
                        onChange={(e) => setFormData({ ...formData, validadeCartao: e.target.value })}
                        placeholder="MM/AA"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={formData.cvvCartao}
                        onChange={(e) => setFormData({ ...formData, cvvCartao: e.target.value })}
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Finalizar Compra */}
            <button
              onClick={finalizarPedido}
              disabled={!validarCartao() || loading || !formData.formaPagamento || !formData.dataEntrega || !formData.horario}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                !validarCartao() || loading || !formData.formaPagamento || !formData.dataEntrega || !formData.horario
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {loading ? 'Processando...' : 'Finalizar Compra'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}