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
        const produto = await read('produtos', 'id_produto = ?', [id]);
        return produto;
    } catch (err) {
        console.error('Erro ao obter produto por ID:', err);
        throw err;
    }
};

const criarProduto = async (produtoData) => {
    try {
        const { nome, preco, estoque } = produtoData;
        
        if (!nome || !preco || estoque === undefined) {
            throw new Error('Nome, preço e estoque são obrigatórios');
        }

        const produto = {
            nome: nome.trim(),
            preco: parseFloat(preco),
            estoque: parseInt(estoque)
        };

        return await create('produtos', produto);
    } catch (err) {
        console.error('Erro ao criar produto:', err);
        throw err;
    }
};

const atualizarProduto = async (id, produtoData) => {
    try {
        const { nome, preco, estoque } = produtoData;
        
        const updates = {};
        if (nome) updates.nome = nome.trim();
        if (preco !== undefined) updates.preco = parseFloat(preco);
        if (estoque !== undefined) updates.estoque = parseInt(estoque);

        if (Object.keys(updates).length === 0) {
            throw new Error('Nenhum dado para atualizar');
        }

        return await update('produtos', updates, 'id_produto = ?', [id]);
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