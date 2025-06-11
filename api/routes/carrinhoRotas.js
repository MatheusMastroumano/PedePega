import express from "express";
import {
  obterCarrinhoController,
  adicionarItemController,
  atualizarQuantidadeController,
  removerItemController,
  limparCarrinhoController
} from '../controllers/CarrinhoController.js';
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas do carrinho precisam de autenticação
router.use(authMiddleware);

// GET /carrinho - Obter carrinho do usuário
router.get("/", obterCarrinhoController);

// POST /carrinho/items - Adicionar item ao carrinho
router.post("/itens", adicionarItemController);

// PUT /carrinho/items/:id - Atualizar quantidade de um item
router.put("/itens/:id", atualizarQuantidadeController);

// DELETE /carrinho/items/:id - Remover item específico do carrinho
router.delete("/itens/:id", removerItemController);

// DELETE /carrinho - Limpar todo o carrinho
router.delete("/", limparCarrinhoController);

export default router;