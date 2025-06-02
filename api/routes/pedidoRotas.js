import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
    criarPedidoController, 
    listarPedidosController, 
    obterItensPedidoController 
} from "../controllers/PedidoController.js";

const router = express.Router();

router.post("/", authMiddleware, criarPedidoController);
router.get("/", authMiddleware, listarPedidosController);
router.get("/:id/itens", authMiddleware, obterItensPedidoController);

export default router;
