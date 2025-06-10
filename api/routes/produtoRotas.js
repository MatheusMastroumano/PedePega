import express from 'express';
import { listarProdutosController, obterProdutoPorIdController, criarProdutoController, atualizarProdutoController, deletarProdutoController } from '../controllers/ProdutoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar diretório de uploads se não existir
const uploadsPath = path.join(__dirname, '../uploads/produtos');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const nomeArquivo = `produto-${uniqueSuffix}${extension}`;
        cb(null, nomeArquivo);
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/jfif',
        'image/avif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: fileFilter
});

// Middleware para tratamento de erros do multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                mensagem: 'Arquivo muito grande. Tamanho máximo: 5MB' 
            });
        }
        return res.status(400).json({ 
            mensagem: `Erro no upload: ${err.message}` 
        });
    }
    
    if (err) {
        return res.status(400).json({ 
            mensagem: err.message 
        });
    }
    
    next();
};

// Rotas
router.get('/', listarProdutosController);
router.get('/:id', obterProdutoPorIdController);

// Rotas protegidas com autenticação
router.post('/', 
    authMiddleware(['admin']),
    upload.single('capa'), 
    handleMulterError,
    criarProdutoController
);

router.put('/:id', 
    authMiddleware(['admin']),
    upload.single('capa'), 
    handleMulterError,
    atualizarProdutoController
);

router.delete('/:id',
     authMiddleware(['admin']),
     deletarProdutoController);

export default router;