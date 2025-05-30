import { obterCarrinho, calcularTotalCarrinho, limparCarrinho } from "../models/Carrinho.js";
import { criarPedido, listarPedidosPorUsuario, obterItensDoPedido } from "../models/Pedido.js";

const criarPedidoController = async (req, res) => {
    const usuarioId = req.usuarioId;
    try {
        const carrinho = await obterCarrinho(usuarioId);
        if (!carrinho || carrinho.length === 0) {
            return res.status(400).json({ mensagem: "Carrinho vazio" });
        }

        const total = await calcularTotalCarrinho(usuarioId);

        const itens = carrinho.map(item => ({
            id_produto: item.id_produto,
            quantidade: item.quantidade,
            preco: item.preco
        }));

        const pedidoId = await criarPedido(usuarioId, itens, total);
        await limparCarrinho(usuarioId);

        res.status(201).json({ mensagem: "Pedido criado com sucesso", pedidoId });
    } catch (err) {
        console.error("Erro ao criar pedido:", err);
        res.status(500).json({ mensagem: "Erro ao criar pedido" });
    }
};

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

export { criarPedidoController, listarPedidosController, obterItensPedidoController };
