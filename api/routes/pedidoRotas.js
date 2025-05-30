import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
    criarPedidoController, 
    listarPedidosController, 
    obterItensPedidoController 
} from "../controllers/PedidoController.js";

const router = express.Router();

router.post("/pedido", authMiddleware, criarPedidoController);
router.get("/pedido", authMiddleware, listarPedidosController);
router.get("/pedido/:id/itens", authMiddleware, obterItensPedidoController);

export default router;
