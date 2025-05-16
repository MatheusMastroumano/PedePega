import express from 'express';
import { listarProdutosController, obterProdutoPorIdController, criarProdutoController, atualizarProdutoController, deletarProdutoController } from '../controllers/ProdutoController.js';
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
router.post('/', criarProdutoController);
router.put('/:id', atualizarProdutoController);
router.delete('/:id', deletarProdutoController);

export default router;