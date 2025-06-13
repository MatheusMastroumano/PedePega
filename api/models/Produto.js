import { read, readAll, create, update, deleteRecord } from '../config/database.js';

const listarProdutos = async () => {
    try {
        const produtos = await readAll('produtos');
        return produtos;
    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        throw err;
    }
};

const obterProdutoPorId = async (id) => {
    try {
<<<<<<< Updated upstream
        const produto = await read('produtos', 'id_produto = ?', [id]);
        return produto;
=======
        return await read('produtos', `id_produto = ?`, [id]);
    } catch (err) {
        console.error('Erro ao obter produto por ID:', err);
        throw err;
    }
};

const criarProduto = async (produtoData) => {
    try {
        // Se não houver imagem, usar uma imagem padrão
        if (!produtoData.imagem_url) {
            produtoData.imagem_url = '/img/produtos/default.png';
        }
        return await create('produtos', produtoData);
    } catch (err) {
        console.error('Erro ao criar produto:', err);
        throw err;
    }
};

const atualizarProduto = async (id, produtoData) => {
    try {
        return await update('produtos', produtoData, 'id_produto = ?', [id]);
    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        throw err;
    }
};

const deletarProduto = async (id) => {
    try {
        // Verificar se o produto está em algum pedido ativo
        const pedidosAtivos = await readAll('item_pedido', 'id_produto = ?', [id]);
        if (pedidosAtivos && pedidosAtivos.length > 0) {
            throw new Error('Não é possível deletar um produto que está em pedidos ativos');
        }

        return await deleteRecord('produtos', 'id_produto = ?', [id]);
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        throw err;
    }
};

export { 
    listarProdutos, 
    obterProdutoPorId, 
    criarProduto, 
    atualizarProduto, 
    deletarProduto 
};