'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../components/Cart/contextoCart';
import { useAuth } from '../components/AuthContexto/ContextoAuth';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const { cartItems, total, clearCart, fetchCartFromAPI } = useCart();
  const { token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [dadosPagamento, setDadosPagamento] = useState({});
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [errors, setErrors] = useState({});

  // Carrega o carrinho quando o componente monta
  useEffect(() => {
    if (token) {
      fetchCartFromAPI();
    }
  }, [token]);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!token) {
      router.push('/FormLoginRegister');
    }
  }, [token, router]);

  // Redireciona se carrinho estiver vazio
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.push('/carrinho');
    }
  }, [cartItems, loading, router]);

  const validateForm = () => {
    const newErrors = {};

    if (!formaPagamento) {
      newErrors.formaPagamento = 'Selecione uma forma de pagamento';
    }

    if (formaPagamento === 'cartao_credito' || formaPagamento === 'cartao_debito') {
      if (!dadosPagamento.numero) newErrors.numero = 'Número do cartão é obrigatório';
      if (!dadosPagamento.nome) newErrors.nome = 'Nome no cartão é obrigatório';
      if (!dadosPagamento.cvv) newErrors.cvv = 'CVV é obrigatório';
      if (!dadosPagamento.validade) newErrors.validade = 'Validade é obrigatória';
      
      // Validações específicas
      if (dadosPagamento.numero && dadosPagamento.numero.replace(/\s/g, '').length < 16) {
        newErrors.numero = 'Número do cartão deve ter 16 dígitos';
      }
      if (dadosPagamento.cvv && dadosPagamento.cvv.length < 3) {
        newErrors.cvv = 'CVV deve ter pelo menos 3 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setDadosPagamento(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Remove erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  const finalizarCompra = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/pedidos/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          forma_pagamento: formaPagamento,
          dados_pagamento: dadosPagamento
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao finalizar compra');
      }

      setPedidoCriado(data);

      // Se for PIX, salvar dados do PIX
      if (data.pix) {
        setPixData(data.pix);
      }

      // Se não for PIX (pagamento aprovado), limpar carrinho e redirecionar
      if (formaPagamento !== 'pix') {
        setTimeout(() => {
          router.push('/pedidos');
        }, 3000);
      }

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert(error.message || 'Erro ao finalizar compra');
    } finally {
      setLoading(false);
    }
  };

  const continuarComprando = () => {
    router.push('/PaginaCart');
  };

  // Se o pedido foi criado, mostrar tela de sucesso
  if (pedidoCriado) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-green-600 mb-4">
                Pedido Realizado com Sucesso!
              </h1>
              <p className="text-gray-600 mb-6">
                Pedido #{pedidoCriado.pedido_id} - Total: R$ {pedidoCriado.total.toFixed(2)}
              </p>

              {pixData ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-blue-800 mb-4">Pagamento via PIX</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Código PIX:</p>
                      <div className="bg-white border rounded p-3 font-mono text-sm break-all">
                        {pixData.codigo}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <img 
                        src={pixData.qr_code} 
                        alt="QR Code PIX" 
                        className="mx-auto mb-2"
                        style={{ width: '150px', height: '150px' }}
                      />
                      <p className="text-sm text-gray-600">QR Code para pagamento</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-semibold">
                        ⏰ Expira em: {pixData.tempo_expiracao}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    🎉 Pagamento aprovado! Seu pedido está sendo processado.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/pedidos')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
                >
                  Ver Meus Pedidos
                </button>
                <button
                  onClick={continuarComprando}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || cartItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Revise seu pedido e escolha a forma de pagamento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantidade} x R$ {item.preco.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Forma de Pagamento</h2>

            <div className="space-y-4 mb-6">
              {/* Seleção da forma de pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha a forma de pagamento
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="forma_pagamento"
                      value="cartao_credito"
                      checked={formaPagamento === 'cartao_credito'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="mr-3"
                    />
                    <span className="flex items-center text-black">
                      💳 Cartão de Crédito
                    </span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="forma_pagamento"
                      value="cartao_debito"
                      checked={formaPagamento === 'cartao_debito'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="mr-3"
                    />
                    <span className="flex items-center text-black">
                      💳 Cartão de Débito
                    </span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="forma_pagamento"
                      value="pix"
                      checked={formaPagamento === 'pix'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="mr-3"
                    />
                    <span className="flex items-center text-black">
                      🏦 PIX
                    </span>
                  </label>

                </div>
                {errors.formaPagamento && (
                  <p className="text-red-500 text-sm mt-1">{errors.formaPagamento}</p>
                )}
              </div>

              {/* Campos específicos para cartão */}
              {(formaPagamento === 'cartao_credito' || formaPagamento === 'cartao_debito') && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Dados do Cartão</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={dadosPagamento.numero || ''}
                      onChange={(e) => handleInputChange('numero', formatCardNumber(e.target.value))}
                      className={`w-full p-3 border text-black rounded-lg ${errors.numero ? 'border-red-500' : 'border-gray-300'}`}
                      maxLength="19"
                    />
                    {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="Nome como está no cartão"
                      value={dadosPagamento.nome || ''}
                      onChange={(e) => handleInputChange('nome', e.target.value.toUpperCase())}
                      className={`w-full p-3 border text-black rounded-lg ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Validade
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={dadosPagamento.validade || ''}
                        onChange={(e) => handleInputChange('validade', formatExpiry(e.target.value))}
                        className={`w-full p-3 border text-black rounded-lg ${errors.validade ? 'border-red-500' : 'border-gray-300'}`}
                        maxLength="5"
                      />
                      {errors.validade && <p className="text-red-500 text-sm mt-1">{errors.validade}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={dadosPagamento.cvv || ''}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        className={`w-full p-3 text-black border rounded-lg ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                        maxLength="4"
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Informação para PIX */}
              {formaPagamento === 'pix' && (
                <div className="p-4 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-black mb-2">Pagamento via PIX</h3>
                  <p className="text-black text-sm">
                    Após confirmar o pedido, você receberá um código PIX e QR Code para realizar o pagamento.
                    O pagamento deve ser realizado em até 15 minutos.
                  </p>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="space-y-4">
              <button
                onClick={finalizarCompra}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  `Finalizar Compra - R$ ${total.toFixed(2)}`
                )}
              </button>

              <button
                onClick={() => router.push('/carrinho')}
                className="w-full py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Alterar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;