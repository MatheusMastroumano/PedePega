import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import logger from './logger.js';
import produtoRotas from './routes/produtoRotas.js';
import authRotas from './routes/authRotas.js';
import carrinhoRotas from './routes/carrinhoRotas.js'; 
import pedidoRotas from './routes/pedidoRotas.js';
import pedidoAdminRotas from './routes/pedidoAdminRotas.js';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Rotas
app.use('/api/produtos', produtoRotas);
app.use('/api/auth', authRotas);
app.use('/api/carrinho', carrinhoRotas);
app.use('/api/pedido', pedidoRotas);
app.use("/api/admin/pedidos", pedidoAdminRotas);

app.get('/', (req, res) => {
    res.send('<h1>API PedePega</h1>');
});

app.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(204).send();
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(chalk.bgRed.white(' ERRO '), chalk.red(err.message));
    console.error(chalk.red('Stack:'), err.stack);

    // Erros de validação
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            erro: 'Erro de validação',
            detalhes: err.message
        });
    }

    // Erros de banco de dados
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            erro: 'Registro duplicado',
            detalhes: err.message
        });
    }

    // Erros de autenticação
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            erro: 'Erro de autenticação',
            detalhes: err.message
        });
    }

    // Erro interno do servidor
    res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error(chalk.bgRed.white(' ERRO NÃO CAPTURADO '), err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error(chalk.bgRed.white(' PROMESSA REJEITADA '), err);
    process.exit(1);
});

app.listen(port, () => {
    console.log(chalk.bgBlue.white(' INFO '), chalk.blue(`Servidor rodando em http://localhost:${port}`));
});