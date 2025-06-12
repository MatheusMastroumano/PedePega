import express from "express";
import {
  criarPedido,
  obterPedidos,
  obterPedido,
  atualizarPedido,
  removerPedido
} from "../controllers/pedidoController.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

// Rotas de pedidos
router.post("/", verificarToken, criarPedido);
router.get("/", verificarToken, obterPedidos);
router.get("/:id", verificarToken, obterPedido);
router.put("/:id", verificarToken, atualizarPedido);
router.delete("/:id", verificarToken, removerPedido);

export default router; 