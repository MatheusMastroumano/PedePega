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
const port = 3001;

app.use(cors());
app.use(express.json());

// Usar o middleware de logging com Chalk
app.use(logger);

// Rotas existentes
app.use('/api/produtos', produtoRotas);
app.use('/api/auth', authRotas);
app.use('/api/carrinho', carrinhoRotas);
app.use('/api/pedido', pedidoRotas);
app.use("/api/pedidos", pedidoRotas);
app.use("/api/admin/pedidos", pedidoAdminRotas);

app.get('/', (req, res) => {
    res.send('<h1>API PedePega</h1>');
});

app.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({mensagem: 'Rota não encontrada...'});
});

// Capturar erros não tratados
app.use((err, req, res, next) => {
    console.error(chalk.bgRed.white(' ERRO '), chalk.red(err.message));
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

app.listen(port, () => {
    console.log(chalk.bgBlue.white(' INFO '), chalk.blue(`Servidor rodando em http://localhost:${port}`));
});