import express from 'express';
import { listarProdutosController, obterProdutoPorIdController, criarProdutoController, atualizarProdutoController, deletarProdutoController } from '../controllers/ProdutoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, path.join(__dirname, '../uploads/'));
},
filename: (req, file, cb) => {
const nomeArquivo = `${Date.now()}-${file.originalname}`;
cb(null, nomeArquivo);
}
});
const upload = multer({ storage: storage });

router.get('/', listarProdutosController);
router.get('/:id', obterProdutoPorIdController);
router.post('/', authMiddleware, upload.single('capa'), criarProdutoController);
router.put('/:id', authMiddleware,upload.single('capa'), atualizarProdutoController);
router.delete('/:id', authMiddleware, deletarProdutoController);

export default router;