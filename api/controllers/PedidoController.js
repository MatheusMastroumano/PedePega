import { create, readAll, read, update, remove } from "../models/Pedido.js";
import { obterCarrinho, limparCarrinho } from "../models/Carrinho.js";

// Função para criar um novo pedido
export const criarPedido = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { dataRetirada, horarioRetirada, formaPagamento, dadosCartao } = req.body;

    console.log('Dados recebidos:', {
      usuarioId,
      dataRetirada,
      horarioRetirada,
      formaPagamento,
      dadosCartao
    });

    // Validações básicas
    if (!dataRetirada || !horarioRetirada || !formaPagamento) {
      return res.status(400).json({ erro: "Data, horário e forma de pagamento são obrigatórios" });
    }

    // Validar formato da data (YYYY-MM-DD)
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(dataRetirada)) {
      return res.status(400).json({
        erro: "Formato de data inválido. Use YYYY-MM-DD"
      });
    }

    // Validar formato do horário (HH:mm)
    const horarioRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(horarioRetirada)) {
      return res.status(400).json({
        erro: "Formato de horário inválido. Use HH:mm"
      });
    }

    // Validar se a data é futura
    const dataRetiradaObj = new Date(dataRetirada);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataRetiradaObj < hoje) {
      return res.status(400).json({
        erro: "A data de retirada deve ser futura"
      });
    }

    // Obter itens do carrinho
    const carrinho = await obterCarrinho(usuarioId);
    console.log('Carrinho:', carrinho);

    if (!carrinho || carrinho.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio" });
    }

    // Calcular total
    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    console.log('Total calculado:', total);

    // Validar dados do cartão se necessário
    if ((formaPagamento === 'debito' || formaPagamento === 'credito') && !dadosCartao) {
      return res.status(400).json({
        erro: "Dados do cartão são obrigatórios para pagamento com cartão"
      });
    }

    // Criar o pedido
    const pedido = await create({
      usuarioId,
      itens: carrinho,
      total,
      dataRetirada,
      horarioRetirada,
      formaPagamento,
      dadosCartao,
      status: 'pendente',
      statusPagamento: 'pendente'
    });

    console.log('Pedido criado:', pedido);

    // Limpar carrinho após criar pedido
    await limparCarrinho(usuarioId);

    res.status(201).json({
      mensagem: "Pedido criado com sucesso",
      pedido
    });
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({ 
      erro: "Erro ao criar pedido",
      detalhes: err.message 
    });
  }
};

// Função para obter todos os pedidos
export const obterPedidos = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const pedidos = await readAll(usuarioId);
    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao obter pedidos:", err);
    res.status(500).json({ erro: "Erro ao obter pedidos" });
  }
};

// Função para obter um pedido específico
export const obterPedido = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const pedido = await read(req.params.id, usuarioId);
    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }
    res.json(pedido);
  } catch (err) {
    console.error("Erro ao obter pedido:", err);
    res.status(500).json({ erro: "Erro ao obter pedido" });
  }
};

// Função para atualizar um pedido
export const atualizarPedido = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { id } = req.params;
    const { status, statusPagamento } = req.body;

    const pedido = await update(id, usuarioId, { status, statusPagamento });
    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    res.json(pedido);
  } catch (err) {
    console.error("Erro ao atualizar pedido:", err);
    res.status(500).json({ erro: "Erro ao atualizar pedido" });
  }
};

// Função para remover um pedido
export const removerPedido = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const pedido = await remove(req.params.id, usuarioId);
    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }
    res.json({ mensagem: "Pedido removido com sucesso" });
  } catch (err) {
    console.error("Erro ao remover pedido:", err);
    res.status(500).json({ erro: "Erro ao remover pedido" });
  }
};
