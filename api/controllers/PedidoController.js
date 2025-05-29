import { 
    criarPedido, 
    obterPedidoPorId, 
    listarPedidosUsuario,
    atualizarStatusPedido 
  } from '../models/Pedido.js';
  import { 
    obterCarrinho, 
    limparCarrinho, 
    calcularTotalCarrinho 
  } from '../models/Carrinho.js';
  import { read, update, getConnection } from '../config/database.js';
  
  const finalizarCompraController = async (req, res) => {
    const connection = await getConnection();
    
    try {
      const usuarioId = req.usuarioId;
      const { forma_pagamento, dados_pagamento } = req.body;
  
      console.log('Iniciando finalização de compra para usuário:', usuarioId);
  
      // Validar forma de pagamento
      const formasPagamentoValidas = ['cartao_credito', 'cartao_debito', 'pix'];
      if (!formasPagamentoValidas.includes(forma_pagamento)) {
        return res.status(400).json({ 
          mensagem: 'Forma de pagamento inválida. Use: cartao_credito, cartao_debito ou pix' 
        });
      }
  
      // Validar dados do pagamento
      if (!dados_pagamento) {
        return res.status(400).json({ mensagem: 'Dados do pagamento são obrigatórios' });
      }
  
      if (forma_pagamento.startsWith('cartao_') && (!dados_pagamento.numero || !dados_pagamento.nome || !dados_pagamento.cvv || !dados_pagamento.validade)) {
        return res.status(400).json({ 
          mensagem: 'Para pagamento com cartão, forneça: numero, nome, cvv e validade' 
        });
      }
  
      // Iniciar transação
      await connection.beginTransaction();
  
      try {
        // Obter itens do carrinho
        const itensCarrinho = await obterCarrinho(usuarioId);
        
        if (!itensCarrinho || itensCarrinho.length === 0) {
          await connection.rollback();
          return res.status(400).json({ mensagem: 'Carrinho vazio' });
        }
  
        console.log('Itens do carrinho:', itensCarrinho);
  
        // Verificar estoque e disponibilidade de todos os produtos
        for (const item of itensCarrinho) {
          const produto = await read('produto', 'id_produto = ?', [item.id_produto]);
          
          if (!produto) {
            await connection.rollback();
            return res.status(404).json({ 
              mensagem: `Produto ${item.nome} não encontrado` 
            });
          }
  
          if (!produto.disponivel) {
            await connection.rollback();
            return res.status(400).json({ 
              mensagem: `Produto ${item.nome} não está mais disponível` 
            });
          }
  
          if (produto.estoque < item.quantidade) {
            await connection.rollback();
            return res.status(400).json({ 
              mensagem: `Estoque insuficiente para ${item.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}` 
            });
          }
        }
  
        // Calcular total
        const totalPedido = await calcularTotalCarrinho(usuarioId);
        
        if (!totalPedido || totalPedido <= 0) {
          await connection.rollback();
          return res.status(400).json({ mensagem: 'Total do pedido inválido' });
        }
  
        // Criar o pedido
        const pedidoData = {
          id_usuario: usuarioId,
          total: totalPedido,
          status: 'aguardando_pagamento',
          forma_pagamento: forma_pagamento,
          dados_pagamento: JSON.stringify(dados_pagamento),
          data_pedido: new Date()
        };
  
        const pedidoId = await criarPedido(pedidoData);
        console.log('Pedido criado com ID:', pedidoId);
  
        // Criar itens do pedido e atualizar estoque
        for (const item of itensCarrinho) {
          // Inserir item do pedido
          const itemPedidoData = {
            id_pedido: pedidoId,
            id_produto: item.id_produto,
            quantidade: item.quantidade,
            preco_unitario: item.preco,
            subtotal: item.quantidade * parseFloat(item.preco)
          };
  
          await connection.execute(
            'INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
            [itemPedidoData.id_pedido, itemPedidoData.id_produto, itemPedidoData.quantidade, itemPedidoData.preco_unitario, itemPedidoData.subtotal]
          );
  
          // Atualizar estoque do produto
          const novoEstoque = item.estoque - item.quantidade;
          await update('produto', 
            { estoque: novoEstoque }, 
            'id_produto = ?', 
            [item.id_produto]
          );
  
          console.log(`Estoque atualizado para produto ${item.id_produto}: ${item.estoque} -> ${novoEstoque}`);
        }
  
        // Simular processamento do pagamento
        let statusPagamento = 'pendente';
        
        if (forma_pagamento === 'pix') {
          // Para PIX, gerar código/QR code (simulado)
          statusPagamento = 'aguardando_pagamento';
        } else {
          // Para cartões, simular aprovação (em produção, integraria com gateway de pagamento)
          statusPagamento = 'aprovado';
        }
  
        // Atualizar status do pedido
        await update('pedido', 
          { status: statusPagamento === 'aprovado' ? 'confirmado' : 'aguardando_pagamento' }, 
          'id_pedido = ?', 
          [pedidoId]
        );
  
        // Limpar carrinho apenas se o pagamento foi aprovado ou está aguardando (PIX)
        if (statusPagamento === 'aprovado' || forma_pagamento === 'pix') {
          await limparCarrinho(usuarioId);
          console.log('Carrinho limpo após finalização da compra');
        }
  
        // Confirmar transação
        await connection.commit();
  
        let resposta = {
          mensagem: 'Pedido criado com sucesso!',
          pedido_id: pedidoId,
          total: totalPedido,
          status: statusPagamento === 'aprovado' ? 'confirmado' : 'aguardando_pagamento'
        };
  
        // Se for PIX, adicionar informações de pagamento
        if (forma_pagamento === 'pix') {
          resposta.pix = {
            codigo: `PIX${pedidoId}${Date.now()}`, // Código PIX simulado
            qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`, // QR Code simulado
            tempo_expiracao: '15 minutos'
          };
        }
  
        res.status(201).json(resposta);
  
      } catch (transactionError) {
        await connection.rollback();
        throw transactionError;
      }
  
    } catch (err) {
      console.error('Erro ao finalizar compra:', err);
      res.status(500).json({ mensagem: 'Erro interno do servidor ao finalizar compra' });
    } finally {
      connection.release();
    }
  };
  
  const obterPedidosController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const pedidos = await listarPedidosUsuario(usuarioId);
      res.json(pedidos);
    } catch (err) {
      console.error('Erro ao obter pedidos:', err);
      res.status(500).json({ mensagem: 'Erro ao obter pedidos' });
    }
  };
  
  const obterPedidoPorIdController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const pedidoId = req.params.id;
      
      const pedido = await obterPedidoPorId(pedidoId, usuarioId);
      
      if (!pedido) {
        return res.status(404).json({ mensagem: 'Pedido não encontrado' });
      }
  
      res.json(pedido);
    } catch (err) {
      console.error('Erro ao obter pedido:', err);
      res.status(500).json({ mensagem: 'Erro ao obter pedido' });
    }
  };
  
  export {
    finalizarCompraController,
    obterPedidosController,
    obterPedidoPorIdController
  };