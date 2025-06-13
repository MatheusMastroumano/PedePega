import { 
    criarPedido, 
    listarPedidosPorUsuario, 
    listarTodosPedidosAtivos, 
    obterItensDoPedido,
    alterarStatusPedido,
    finalizarPedido,
    cancelarPedido,
    listarPedidosAtivos
} from "../models/Pedido.js";
import { obterCarrinho, limparCarrinho } from "../models/Carrinho.js";
import { validarHorarioRetirada } from "../config/database.js";

// Função para criar um novo pedido
const criarPedidoController = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const { itens, total } = req.body;

        if (!itens || itens.length === 0) {
            return res.status(400).json({ mensagem: 'Nenhum item fornecido' });
        }

        // Criar pedido com os itens fornecidos
        const pedidoId = await criarPedido(
            usuarioId, 
            itens, 
            total
        );

        // Limpar carrinho após criar pedido
        await limparCarrinho(usuarioId);

        res.status(201).json({ 
            mensagem: 'Pedido criado com sucesso', 
            pedidoId,
            total
        });
    } catch (err) {
        console.error('Erro ao criar pedido:', err);
        res.status(500).json({ mensagem: err.message || 'Erro ao criar pedido' });
    }
};

// Função para obter todos os pedidos
const listarPedidosController = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        if (!usuarioId) {
            return res.status(401).json({ mensagem: 'Usuário não autenticado' });
        }
        const pedidos = await listarPedidosPorUsuario(usuarioId);
        res.json({ pedidos });
    } catch (err) {
        console.error('Erro ao listar pedidos:', err);
        res.status(500).json({ mensagem: err.message || 'Erro ao listar pedidos' });
    }
};

// Função para obter todos os pedidos ativos
const listarTodosPedidosAtivosController = async (req, res) => {
    try {
        const pedidos = await listarTodosPedidosAtivos();
        res.json(pedidos);
    } catch (err) {
        console.error('Erro ao listar todos os pedidos:', err);
        res.status(500).json({ mensagem: 'Erro ao listar pedidos' });
    }
};

// Função para obter pedidos ativos do usuário
const listarPedidosAtivosController = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        if (!usuarioId) {
            return res.status(401).json({ mensagem: 'Usuário não autenticado' });
        }
        const pedidos = await listarPedidosAtivos(usuarioId);
        res.json({ pedidos });
    } catch (err) {
        console.error('Erro ao listar pedidos ativos:', err);
        res.status(500).json({ mensagem: err.message || 'Erro ao listar pedidos ativos' });
    }
};

// Função para obter itens de um pedido específico
const obterItensPedidoController = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const itens = await obterItensDoPedido(pedidoId);
        res.json(itens);
    } catch (err) {
        console.error('Erro ao obter itens do pedido:', err);
        res.status(500).json({ mensagem: 'Erro ao obter itens do pedido' });
    }
};

// Função para atualizar status de um pedido
const alterarStatusPedidoController = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ mensagem: 'Status é obrigatório' });
        }

        await alterarStatusPedido(pedidoId, status);
        res.json({ mensagem: 'Status do pedido atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao alterar status do pedido:', err);
        res.status(500).json({ mensagem: 'Erro ao alterar status do pedido' });
    }
};

// Função para finalizar um pedido
const finalizarPedidoController = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const usuarioId = req.usuarioId;
        await finalizarPedido(pedidoId, usuarioId);
        res.json({ mensagem: 'Pedido finalizado com sucesso' });
    } catch (err) {
        console.error('Erro ao finalizar pedido:', err);
        res.status(500).json({ mensagem: err.message || 'Erro ao finalizar pedido' });
    }
};

// Função para cancelar um pedido
const cancelarPedidoController = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const usuarioId = req.usuarioId;
        await cancelarPedido(pedidoId, usuarioId);
        res.json({ mensagem: 'Pedido cancelado com sucesso' });
    } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
        res.status(500).json({ mensagem: err.message || 'Erro ao cancelar pedido' });
    }
};

export {
    criarPedidoController,
    listarPedidosController,
    listarTodosPedidosAtivosController,
    listarPedidosAtivosController,
    obterItensPedidoController,
    alterarStatusPedidoController,
    finalizarPedidoController,
    cancelarPedidoController
};
