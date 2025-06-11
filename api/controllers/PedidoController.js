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
} from "../models/Pedido.js";

//funcao para criar pedido
const criarPedidoController = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const carrinho = await obterCarrinho(usuarioId);
    if (!carrinho || carrinho.length === 0) {
      return res.status(400).json({ mensagem: "Carrinho vazio" });
    }

    const total = await calcularTotalCarrinho(usuarioId);

    const itens = carrinho.map((item) => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      preco: item.preco,
    }));

    const pedidoId = await criarPedido(usuarioId, itens, total);
    await limparCarrinho(usuarioId);

    res.status(201).json({ mensagem: "Pedido criado com sucesso", pedidoId });
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({ mensagem: "Erro ao criar pedido" });
  }
};

//funcao para finalizar pedido
const finalizarPedidoController = async (req, res) => {
  const usuarioId = req.usuarioId;
  const pedidoId = req.params.id;

  try {
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

//funcao para cancelar pedido
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
      return res.status(400).json({ mensagem: "Apenas pedidos pendentes podem ser cancelados" });
    }

    return res.status(500).json({ mensagem: "Erro ao cancelar pedido" });
  }
};

//funcao para listar pedidos do usuario logado
const listarPedidosController = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const pedidos = await listarPedidosPorUsuario(usuarioId);
    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao listar pedidos:", err);
    res.status(500).json({ mensagem: "Erro ao listar pedidos" });
  }
};

//funcao para listar pedidos com status ativo do usuario logado
const listarPedidosAtivosController = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const pedidos = await listarPedidosAtivos(usuarioId);
    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao listar pedidos ativos", err);
    res.status(500).json({ mensagem: "Erro ao listar pedidos ativos" });
  }
};

//funcao para o admin ver todos pedidos ativos (necessario login admin)
const listarTodosPedidosAtivosController = async (req, res) => {
  try {
    const pedidos = await listarTodosPedidosAtivos();
    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao listar todos os pedidos ativos", err);
    res.status(500).json({ mensagem: "Erro ao listar pedidos ativos" });
  }
};

//funcao para o admin alterar status de algum pedido (necessario login admin)
const alterarStatusPedidoController = async (req, res) => {
  const pedidoId = req.params.id;
  const { status } = req.body;

  try {
    await alterarStatusPedido(pedidoId, status);
    res.json({ mensagem: "Status do pedido alterado com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar status do pedido", err);
    if (err.message === "Status inválido") {
      return res.status(400).json({ mensagem: "Status inválido" });
    }
    res.status(500).json({ mensagem: "Erro ao alterar status do pedido" });
  }
};

//funcao para listar os itens pedidos
const obterItensPedidoController = async (req, res) => {
  const pedidoId = req.params.id;
  try {
    const itens = await obterItensDoPedido(pedidoId);
    res.json(itens);
  } catch (err) {
    console.error("Erro ao obter itens do pedido:", err);
    res.status(500).json({ mensagem: "Erro ao obter itens do pedido" });
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
};
