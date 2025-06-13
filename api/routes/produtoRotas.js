import express from 'express';
import { listarProdutosController, obterProdutoPorIdController, criarProdutoController, atualizarProdutoController, deletarProdutoController } from '../controllers/ProdutoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', listarProdutosController);
router.get('/:id', obterProdutoPorIdController);

// Rotas protegidas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, criarProdutoController);
router.put('/:id', authMiddleware, adminMiddleware, atualizarProdutoController);
router.delete('/:id', authMiddleware, adminMiddleware, deletarProdutoController);

export default router;