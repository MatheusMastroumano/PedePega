import {
  readAll,
  read,
  create,
  update,
  deleteRecord,
  getConnection,
} from "../config/database.js";

const obterCarrinho = async (usuarioId) => {
  try {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT 
          carrinho_item.id_carrinho_item,
          carrinho_item.id_usuario,
          carrinho_item.id_produto,
          carrinho_item.quantidade,
          produto.nome,
          produto.preco,
          produto.estoque,
          produto.imagemPath,
          produto.disponivel
        FROM carrinho_item 
        JOIN produto ON carrinho_item.id_produto = produto.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produto.disponivel = 1
      `;
      console.log("Query:", sql, "Params:", [usuarioId]);
      const [rows] = await connection.execute(sql, [usuarioId]);
      return rows;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Erro ao obter carrinho:", err);
    throw err;
  }
};

const calcularTotalCarrinho = async (usuarioId) => {
  try {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT carrinho_item.quantidade, produto.preco
        FROM carrinho_item 
        JOIN produto ON carrinho_item.id_produto = produto.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produto.disponivel = 1
      `;
      console.log("Query calcular total:", sql, "Params:", [usuarioId]);
      const [items] = await connection.execute(sql, [usuarioId]);
      const total = items.reduce((total, item) => {
        return total + item.quantidade * parseFloat(item.preco);
      }, 0);
      console.log("Total calculado:", total);
      return total;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Erro ao calcular total:", err);
    throw err;
  }
};

const adicionarItemCarrinho = async (usuarioId, produtoId, quantidade) => {
  try {
    console.log("Adicionando item ao carrinho:", { usuarioId, produtoId, quantidade });
    
    const produto = await read("produto", "id_produto = ?", [produtoId]);
    console.log("Produto encontrado:", produto);

    if (!produto) {
      return { erro: "Produto não encontrado" };
    }

    if (!produto.disponivel) {
      return { erro: "Produto não está disponível" };
    }

    // Verifica se há estoque suficiente
    const estoque = parseInt(produto.estoque) || 0;
    const quantidadeNum = parseInt(quantidade);
    
    console.log("Estoque disponível:", estoque, "Quantidade solicitada:", quantidadeNum);
    
    if (estoque < quantidadeNum) {
      return { erro: "Estoque insuficiente" };
    }

    // Verifica se já está no carrinho
    const itemExistente = await read(
      "carrinho_item",
      "id_usuario = ? AND id_produto = ?",
      [usuarioId, produtoId]
    );

    if (itemExistente) {
      const novaQuantidade = parseInt(itemExistente.quantidade) + quantidadeNum;
      console.log("Item já existe, nova quantidade:", novaQuantidade);
      
      // Verifica se a nova quantidade não excede o estoque
      if (estoque < novaQuantidade) {
        return { erro: "Estoque insuficiente para a nova quantidade" };
      }
      
      // Atualiza a quantidade no carrinho
      const resultado = await update(
        "carrinho_item",
        { quantidade: novaQuantidade },
        "id_carrinho_item = ?",
        [itemExistente.id_carrinho_item]
      );
      
      console.log("Item atualizado no carrinho");
      return resultado;
    } else {
      // Cria novo item no carrinho
      const itemData = {
        id_usuario: usuarioId,
        id_produto: produtoId,
        quantidade: quantidadeNum,
      };

      console.log("Criando novo item no carrinho:", itemData);
      const resultado = await create("carrinho_item", itemData);
      console.log("Item criado no carrinho");
      return resultado;
    }
  } catch (err) {
    console.error("Erro ao adicionar item ao carrinho:", err);
    throw err;
  }
};

const atualizarQuantidadeItem = async (usuarioId, itemId, quantidade) => {
  try {
    console.log("Atualizando quantidade:", { usuarioId, itemId, quantidade });
    
    // Verificar se o item existe no carrinho
    const item = await read(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
    
    if (!item) {
      console.log("Item não encontrado no carrinho");
      return 0; // Retorna 0 para indicar que o item não foi encontrado
    }

    // Buscar o produto associado
    const produto = await read("produto", "id_produto = ?", [item.id_produto]);
    if (!produto) {
      return { erro: "Produto não encontrado" };
    }

    if (!produto.disponivel) {
      return { erro: "Produto não está disponível" };
    }

    // Verificar se há estoque suficiente
    const estoque = parseInt(produto.estoque) || 0;
    const quantidadeNum = parseInt(quantidade);
    
    console.log("Estoque disponível:", estoque, "Nova quantidade:", quantidadeNum);

    if (quantidadeNum > estoque) {
      return { erro: "Estoque insuficiente" };
    }

    // Atualizar a quantidade no carrinho
    const resultado = await update(
      "carrinho_item",
      { quantidade: quantidadeNum },
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
    
    console.log("Quantidade atualizada com sucesso");
    return resultado;
  } catch (err) {
    console.error("Erro ao atualizar quantidade carrinho:", err);
    throw err;
  }
};

const removerItemCarrinho = async (usuarioId, itemId) => {
  try {
    console.log("Removendo item do carrinho:", { usuarioId, itemId });
    
    // Verificar se o item existe no carrinho
    const item = await read(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
    
    if (!item) {
      console.log("Item não encontrado no carrinho");
      return 0; // Retorna 0 para indicar que o item não foi encontrado
    }

    // Remover o item do carrinho
    const resultado = await deleteRecord(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
    
    console.log("Item removido do carrinho");
    return resultado;
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    throw err;
  }
};

const limparCarrinho = async (usuarioId) => {
  try {
    console.log("Limpando carrinho do usuário:", usuarioId);
    
    // Limpar o carrinho
    const resultado = await deleteRecord("carrinho_item", "id_usuario = ?", [usuarioId]);
    
    console.log("Carrinho limpo com sucesso");
    return resultado;
  } catch (err) {
    console.error("Erro ao limpar carrinho:", err);
    throw err;
  }
};

const contarItensCarrinho = async (usuarioId) => {
  try {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT SUM(quantidade) as total_itens
        FROM carrinho_item 
        JOIN produto ON carrinho_item.id_produto = produto.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produto.disponivel = 1
      `;
      console.log("Query contar itens:", sql, "Params:", [usuarioId]);
      const [rows] = await connection.execute(sql, [usuarioId]);
      const total = rows[0].total_itens || 0;
      console.log("Total de itens no carrinho:", total);
      return total;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Erro ao contar itens do carrinho:", err);
    throw err;
  }
};

export {
  obterCarrinho,
  adicionarItemCarrinho,
  atualizarQuantidadeItem,
  removerItemCarrinho,
  limparCarrinho,
  calcularTotalCarrinho,
  contarItensCarrinho,
};