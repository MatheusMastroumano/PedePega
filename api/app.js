import express from 'express';
const app = express();
const port = 3000;

import produtoRotas from './routes/produtoRotas.js';
import authRotas from './routes/authRotas.js';
import cors from 'cors';

app.use(cors());
app.use(express.json());

const logger = (req, res, next) => {
    const data = new Date();
    console.log(`[${data.toISOString()}] ${req.method} ${req.url}`);
    next();
}

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
})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
})