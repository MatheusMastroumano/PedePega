// routes/carrinhoRotas.js
import express from "express";
import {
  obterCarrinhoController,
  adicionarItemController,
  atualizarQuantidadeController,
  removerItemController,
  limparCarrinhoController,
  contarItensCarrinhoController, // Adicionando este controller
} from '../controllers/CarrinhoController.js';
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas do carrinho precisam de autenticação
router.use(authMiddleware);

// GET /carrinho - Obter carrinho do usuário
router.get("/", obterCarrinhoController);

// GET /carrinho/count - Contar itens do carrinho
router.get("/count", contarItensCarrinhoController);

// POST /carrinho/items - Adicionar item ao carrinho
router.post("/items", adicionarItemController);

// PUT /carrinho/items/:id - Atualizar quantidade de um item
router.put("/items/:id", atualizarQuantidadeController);

// DELETE /carrinho/items/:id - Remover item específico do carrinho
router.delete("/items/:id", removerItemController);

// DELETE /carrinho - Limpar todo o carrinho
router.delete("/", limparCarrinhoController);

export default router;