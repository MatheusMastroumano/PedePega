<<<<<<< Updated upstream
import { create, readAll, read, update, remove } from "../models/Pedido.js";
import { obterCarrinho, limparCarrinho } from "../models/Carrinho.js";
=======
import {
  obterCarrinho,
  calcularTotalCarrinho,
  limparCarrinho,
} from "../models/Carrinho.js";
import {
  criarPedido,
  finalizarPedido,
  cancelarPedido,
  listarPedidosPorUsuario,
  listarPedidosAtivos,
  listarTodosPedidosAtivos,
  alterarStatusPedido,
  obterItensDoPedido,
  listarTodosPedidos,
} from "../models/Pedido.js";
>>>>>>> Stashed changes

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
    await finalizarPedido(pedidoId, usuarioId);
    res.json({ mensagem: "Pedido finalizado com sucesso" });
  } catch (err) {
    console.error("Erro ao finalizar pedido", err);
    if (err.message === "Pedido não encontrado") {
      return res.status(404).json({ mensagem: "Pedido não encontrado" });
    }
    if (err.message === "Pedido já foi finalizado") {
      return res.status(400).json({ mensagem: "Pedido já foi finalizado" });
    }
    return res.status(500).json({ mensagem: "Erro ao finalizar pedido" });
  }
};

const cancelarPedidoController = async (req, res) => {
  const usuarioId = req.usuarioId;
  const pedidoId = req.params.id;

  try {
    await cancelarPedido(usuarioId, pedidoId);
    res.json({ mensagem: "Pedido cancelado com sucesso" });
  } catch (err) {
    console.error("Erro ao cancelar pedido", err);
    if (err.message === "Pedido não encontrado") {
      res.status(404).json({ mensagem: "Pedido não encontrado" });
    }
    if (err.message === "Apenas pedidos pendentes podem ser cancelados") {
      return res
        .status(400)
        .json({ mensagem: "Apenas pedidos pendentes podem ser cancelados" });
    }

    return res.status(500).json({ mensagem: "Erro ao cancelar pedido" });
  }
};

const listarPedidosController = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const pedidos = await listarPedidosPorUsuario(usuarioId);

    // Formatar os dados para a resposta
    const pedidosFormatados = pedidos.map(pedido => ({
      id_pedido: pedido.id_pedido,
      data: pedido.data,
      status: pedido.status,
      total: parseFloat(pedido.total) || 0,
      itens: pedido.itens.map(item => ({
        id_item: item.id_item,
        id_produto: item.id_produto,
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_unitario),
        subtotal: parseFloat(item.quantidade * item.preco_unitario)
      }))
    }));

    res.json(pedidosFormatados);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

// Função para obter um pedido específico
export const obterPedido = async (req, res) => {
  try {
<<<<<<< Updated upstream
    const usuarioId = req.usuarioId;
    const pedido = await read(req.params.id, usuarioId);
    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }
    res.json(pedido);
=======
    const pedidos = await listarPedidosAtivos(usuarioId);
    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao listar pedidos ativos", err);
    res.status(500).json({ mensagem: "Erro ao listar pedidos ativos" });
  }
};

//Controller para admin
const listarTodosPedidosAtivosController = async (req, res) => {
  try {
    const pedidos = await listarTodosPedidosAtivos();

    // Formatar os dados para a resposta
    const pedidosFormatados = pedidos.map(pedido => ({
      id_pedido: pedido.id_pedido,
      data: pedido.data,
      status: pedido.status,
      total: parseFloat(pedido.total) || 0,
      usuario: {
        id: pedido.id_usuario,
        nome: pedido.name_usuario,
        email: pedido.email
      },
      itens: pedido.itens.map(item => ({
        id_item: item.id_item,
        id_produto: item.id_produto,
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_unitario),
        subtotal: parseFloat(item.quantidade * item.preco_unitario)
      }))
    }));

    res.json(pedidosFormatados);
  } catch (error) {
    console.error('Erro ao listar pedidos ativos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos ativos' });
  }
};

//Controller para admin
const alterarStatusPedidoController = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const statusValidos = ['Pendente', 'Em Preparo', 'Pronto', 'Finalizado', 'Cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        error: 'Status inválido',
        statusValidos: statusValidos
      });
    }

    await alterarStatusPedido(pedidoId, status);
    res.json({ mensagem: "Status do pedido alterado com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar status do pedido:", error);
    if (error.message === "Status inválido") {
      return res.status(400).json({ error: "Status inválido" });
    }
    res.status(500).json({ error: "Erro ao alterar status do pedido" });
  }
};

const obterItensPedidoController = async (req, res) => {
  const pedidoId = req.params.id;
  try {
    const itens = await obterItensDoPedido(pedidoId);
    res.json(itens);
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
    console.error("Erro ao obter itens do pedido:", err);
    res.status(500).json({ mensagem: "Erro ao obter itens do pedido" });
  }
};

const listarTodosPedidosController = async (req, res) => {
  try {
    const pedidos = await listarTodosPedidos();

    // Formatar os dados para a resposta
    const pedidosFormatados = pedidos.map(pedido => ({
      id_pedido: pedido.id_pedido,
      data: pedido.data,
      status: pedido.status,
      total: parseFloat(pedido.total) || 0,
      usuario: {
        id: pedido.id_usuario,
        nome: pedido.name_usuario,
        email: pedido.email
      },
      itens: pedido.itens.map(item => ({
        id_item: item.id_item,
        id_produto: item.id_produto,
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_unitario),
        subtotal: parseFloat(item.quantidade * item.preco_unitario)
      }))
    }));

    res.json(pedidosFormatados);
  } catch (error) {
    console.error('Erro ao listar todos os pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar todos os pedidos' });
  }
};

export {
  criarPedidoController,
  finalizarPedidoController,
  cancelarPedidoController,
  listarPedidosController,
  listarPedidosAtivosController,
  listarTodosPedidosAtivosController,
  alterarStatusPedidoController,
  obterItensPedidoController,
  listarTodosPedidosController,
};
