import express from 'express';
import {
  finalizarCompraController,
  obterPedidosController,
  obterPedidoPorIdController
} from '../controllers/PedidoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas as rotas de pedidos precisam de autenticação
router.use(authMiddleware);

// POST /pedidos/finalizar - Finalizar compra
router.post('/finalizar', finalizarCompraController);

// GET /pedidos - Listar pedidos do usuário
router.get('/', obterPedidosController);

// GET /pedidos/:id - Obter pedido específico
router.get('/:id', obterPedidoPorIdController);

export default router;