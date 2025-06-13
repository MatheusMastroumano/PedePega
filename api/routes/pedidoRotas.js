import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
    criarPedidoController, 
    finalizarPedidoController,
    cancelarPedidoController,
    listarPedidosController, 
    listarPedidosAtivosController,
    obterItensPedidoController
} from "../controllers/PedidoController.js";

const router = express.Router();

// Rotas que precisam de autenticação
router.post("/", authMiddleware, criarPedidoController);
router.get("/", authMiddleware, listarPedidosController);
router.get("/ativos", authMiddleware, listarPedidosAtivosController);
router.get("/:id/itens", authMiddleware, obterItensPedidoController);
router.patch("/:id/finalizar", authMiddleware, finalizarPedidoController);
router.patch("/:id/cancelar", authMiddleware, cancelarPedidoController);

export default router;
