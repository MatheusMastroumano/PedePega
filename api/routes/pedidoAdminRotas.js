import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import {
    listarTodosPedidosAtivosController,
    alterarStatusPedidoController,
    listarPedidosController,
    obterItensPedidoController
} from '../controllers/PedidoController.js';

const adminRouter = express.Router();

adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

//Rotas administrativas
adminRouter.get("/ativos", listarTodosPedidosAtivosController);
adminRouter.patch("/:id/status", alterarStatusPedidoController);
adminRouter.get("/:id/itens", obterItensPedidoController);