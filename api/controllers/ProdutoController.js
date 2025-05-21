import { listarProdutos, obterProdutoPorId, criarProduto, atualizarProduto, deletarProduto } from '../models/Produto.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const listarProdutosController = async (req, res) => {
    try {
        const produtos = await listarProdutos();
        res.json(produtos);
    } catch (err) {
        console.error('Erro ao listar produtos: ', err)
        res.status(500).json({ mensagem: 'Erro ao listar produto' });
    }
};

const obterProdutoPorIdController = async (req, res) => {
    try {
        const produto = await obterProdutoPorId(req.params.id);
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ mensagem: 'Produto não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao obter produto por ID: ', err);
        res.status(500).json({ mensagem: 'Erro ao obter produto por ID' });
    }
};

const criarProdutoController = async (req, res) => {
    try {
        const { nome, preco, disponivel } = req.body;
        let imagemPath = null;
        if (req.file) {
            imagemPath = req.file.path.replace(__dirname.replace('\\controllers', ''), '');
        }
        const produtoData = {
            nome: nome,
            preco: preco,
            disponivel: disponivel,
            imagemPath: imagemPath,
        };
        const produtoId = await criarProduto(produtoData);
        res.status(201).json({ mensagem: 'Produto criado com sucesso', produtoId });
    } catch (err) {
        console.error('Erro ao criar produto: ', err);
        res.status(500).json({ mensagem: 'Erro ao criar produto...' })
    }
}

const atualizarProdutoController = async (req, res) => {
    try {
        const produtoId = req.params.id;
        const { nome, preco, disponivel } = req.body;
        let imagemPath = null;
        if (req.file) {
            imagemPath = req.file.path.replace(__dirname.replace('\\controllers', ''), '');
        }
        const produtoData = {
            nome: nome,
            preco: preco,
            disponivel: disponivel,
            imagemPath: imagemPath,
        };
        await atualizarProduto(produtoId, produtoData);
        res.status(200).json({ mensagem: 'Produto atualizado com sucesso' });
    } catch (err) {
        console.error('Não foi possível atualizar o produto', err);
        res.status(500).json({ mensagem: 'Erro ao atualizar produto...' });
    }
};

const deletarProdutoController = async (req, res) => {
    try {
        const produtoId = req.params.id;
        await deletarProduto(produtoId);
        res.status(200).json({ mensagem: 'Produto deletado' });
    } catch (err) {
        console.error('Erro ao deletar produto...', err);
        res.status(500).json({ mensagem: 'Erro ao deletar produto' });
    }
};

export { listarProdutosController, obterProdutoPorIdController, criarProdutoController, atualizarProdutoController, deletarProdutoController };