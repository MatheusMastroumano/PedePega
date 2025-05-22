import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import logger from './logger.js';
import produtoRotas from './routes/produtoRotas.js';
import authRotas from './routes/authRotas.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/produtos', produtoRotas);
app.use('/auth', authRotas);

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
