import { readAll, read, create, update, deleteRecord } from '../config/database.js';

const listarProdutos = async () => {
    try {
        return await readAll('produto');
    } catch (err) {
        console.error('Erro ao listar produtos: ', err);
        throw err;
    }
};

const obterProdutoPorId = async (id) => {
    try {
        return await read('produto', `id_produto = ${id}`)
    } catch (err) {
        console.error('Erro ao obter produto por ID: ', err);
        throw err;
    }
};

const criarProduto = async (produtoData) => {
    try {
        return await create ('produto', produtoData);
    } catch (err) {
        console.error('Erro ao criar produto', err);
        throw err;
    }
};

const atualizarProduto = async (id, produtoData) => {
    try {
        return await update ('produto', produtoData, `id_produto = ${id}`);
    } catch (err) {
        console.error('Erro ao atualizar produto', err);
        throw err;
    }
};

const deletarProduto = async (id) => {
    try {
        return await deleteRecord('produto', `id_produto = ${id}`);
    } catch (err) {
        console.error('Erro ao excluir produto...');
        throw err;
    }
}

export { listarProdutos, obterProdutoPorId, criarProduto, atualizarProduto, deletarProduto };