import { readAll, read, create, update, deleteRecord } from '../config/database.js';

const listarProdutos = async () => {
    try {
        console.log('Listando todos os produtos...');
        const produtos = await readAll('produto');
        console.log('Produtos encontrados:', produtos.length);
        
        // Log dos primeiros produtos para debug
        if (produtos.length > 0) {
            console.log('Exemplo de produto:', {
                id: produtos[0].id_produto,
                nome: produtos[0].nome,
                preco: produtos[0].preco,
                estoque: produtos[0].estoque,
                disponivel: produtos[0].disponivel
            });
        }
        
        return produtos;
    } catch (err) {
        console.error('Erro ao listar produtos: ', err);
        throw err;
    }
};

const obterProdutoPorId = async (id) => {
    try {
        console.log('Buscando produto por ID:', id);
        const produto = await read('produto', 'id_produto = ?', [id]);
        
        if (produto) {
            console.log('Produto encontrado:', {
                id: produto.id_produto,
                nome: produto.nome,
                preco: produto.preco,
                estoque: produto.estoque,
                disponivel: produto.disponivel
            });
        } else {
            console.log('Produto não encontrado para ID:', id);
        }
        
        return produto;
    } catch (err) {
        console.error('Erro ao obter produto por ID: ', err);
        throw err;
    }
};

const criarProduto = async (produtoData) => {
    try {
        console.log('Criando produto:', produtoData);
        
        // Garantir que os campos obrigatórios estejam definidos
        const produtoCompleto = {
            nome: produtoData.nome,
            preco: produtoData.preco,
            disponivel: produtoData.disponivel !== undefined ? produtoData.disponivel : 1,
            estoque: produtoData.estoque !== undefined ? produtoData.estoque : 0,
            imagemPath: produtoData.imagemPath || null
        };
        
        console.log('Dados completos do produto:', produtoCompleto);
        const result = await create('produto', produtoCompleto);
        console.log('Produto criado com ID:', result);
        
        return result;
    } catch (err) {
        console.error('Erro ao criar produto', err);
        throw err;
    }
};

const atualizarProduto = async (id, produtoData) => {
    try {
        console.log('Atualizando produto ID:', id, 'com dados:', produtoData);
        
        // Remover campos undefined para não sobrescrever com null
        const dadosLimpos = {};
        Object.keys(produtoData).forEach(key => {
            if (produtoData[key] !== undefined) {
                dadosLimpos[key] = produtoData[key];
            }
        });
        
        console.log('Dados limpos para atualização:', dadosLimpos);
        const result = await update('produto', dadosLimpos, 'id_produto = ?', [id]);
        console.log('Produto atualizado, linhas afetadas:', result);
        
        return result;
    } catch (err) {
        console.error('Erro ao atualizar produto', err);
        throw err;
    }
};

const deletarProduto = async (id) => {
    try {
        console.log('Deletando produto ID:', id);
        const result = await deleteRecord('produto', 'id_produto = ?', [id]);
        console.log('Produto deletado, linhas afetadas:', result);
        
        return result;
    } catch (err) {
        console.error('Erro ao excluir produto:', err);
        throw err;
    }
};

export { listarProdutos, obterProdutoPorId, criarProduto, atualizarProduto, deletarProduto };