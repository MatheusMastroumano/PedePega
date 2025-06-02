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
        SELECT * 
        FROM carrinho_item 
        JOIN produtos ON carrinho_item.id_produto = produtos.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produtos.estoque > 0
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
        SELECT carrinho_item.quantidade, produtos.preco
        FROM carrinho_item 
        JOIN produtos ON carrinho_item.id_produto = produtos.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produtos.estoque > 0
      `;
      console.log("Query:", sql, "Params:", [usuarioId]);
      const [items] = await connection.execute(sql, [usuarioId]);
      return items.reduce((total, item) => {
        return total + item.quantidade * parseFloat(item.preco);
      }, 0);
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
    const produtos = await read("produtos", "id_produto = ?", [produtoId]);

    console.log("Produto retornado:", produtos);

    if (!produtos) {
      return { erro: "Produto não encontrado" };
    }
    // Verifica se há estoque suficiente
    const estoque = parseInt(produtos.estoque);
    const quantidadeNum = parseInt(quantidade);
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

      // Verifica se a nova quantidade não excede o estoque
      if (estoque < novaQuantidade) {
        return { erro: "Estoque insuficiente para a nova quantidade" };
      }
      // Subtrai a quantidade adicional do estoque
      await update(
        "produtos",
        { estoque: estoque - quantidadeNum },
        "id_produto = ?",
        [produtoId]
      );
      return await update(
        "carrinho_item",
        { quantidade: novaQuantidade },
        "id_carrinho_item = ?",
        [itemExistente.id_carrinho_item]
      );
    } else {
      // Subtrai a quantidade do estoque
      await update(
        "produtos",
        { estoque: estoque - quantidadeNum },
        "id_produto = ?",
        [produtoId]
      );
      // Cria novo item no carrinho
      const itemData = {
        id_usuario: usuarioId,
        id_produto: produtoId,
        quantidade: quantidadeNum,
      };

      return await create("carrinho_item", itemData);
    }
  } catch (err) {
    console.error("Erro ao adicionar item ao carrinho:", err);
    throw err;
  }
};

const atualizarQuantidadeItem = async (usuarioId, itemId, quantidade) => {
  try {
    // Verificar se o item existe no carrinho
    const item = await read(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );

    if (!item) {

      return 0; // Retorna 0 para indicar que o item não foi encontrado
    }

    // Buscar o produto associado
    const produtos = await read("produtos", "id_produto = ?", [item.id_produto]);
    if (!produtos) {
      return { erro: "Produto não encontrado" };
    }
    // Verificar se há estoque suficiente
    const estoque = parseInt(produtos.estoque);
    const quantidadeNum = parseInt(quantidade);
    const quantidadeAtual = parseInt(item.quantidade);
    const diferenca = quantidadeNum - quantidadeAtual;

    if (diferenca > 0 && estoque < diferenca) {
      return { erro: "Estoque insuficiente" };
    }
    // Atualizar o estoque
    if (diferenca !== 0) {
      await update(
        "produtos",
        { estoque: estoque - diferenca },
        "id_produto = ?",
        [item.id_produto]
      );
    }
    // Atualizar a quantidade no carrinho
    return await update(
      "carrinho_item",
      { quantidade: quantidadeNum },
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
  } catch (err) {
    console.error("Erro ao atualizar quantidade carrinho:", err);
    throw err;
  }
};

const removerItemCarrinho = async (usuarioId, itemId) => {
  try {
    // Verificar se o item existe no carrinho
    const item = await read(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
    if (!item) {
      return 0; // Retorna 0 para indicar que o item não foi encontrado
    }
    // Restaurar a quantidade ao estoque
    const produtos = await read("produtos", "id_produto = ?", [item.id_produto]);
    if (produtos) {
      const estoque = parseInt(produtos.estoque);
      const quantidade = parseInt(item.quantidade);
      await update(
        "produtos",
        { estoque: estoque + quantidade },
        "id_produto = ?",
        [item.id_produto]
      );
    }
    // Remover o item do carrinho
    return await deleteRecord(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario = ?",
      [itemId, usuarioId]
    );
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    throw err;
  }
};

const limparCarrinho = async (usuarioId) => {
  try {
    // Obter todos os itens do carrinho
    const itens = await readAll("carrinho_item", "id_usuario = ?", [usuarioId]);

    // Restaurar o estoque para cada item
    for (const item of itens) {
      const produtos = await read("produtos", "id_produto = ?", [
        item.id_produto,
      ]);
      if (produtos) {
        const estoque = parseInt(produtos.estoque);
        const quantidade = parseInt(item.quantidade);
        await update(
          "produtos",
          { estoque: estoque + quantidade },
          "id_produto = ?",
          [item.id_produto]
        );
      }
    }
    // Limpar o carrinho
    return await deleteRecord("carrinho_item", "id_usuario = ?", [usuarioId]);
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
        JOIN produtos ON carrinho_item.id_produto = produtos.id_produto 
        WHERE carrinho_item.id_usuario = ? AND produtos.estoque > 0
      `;
      console.log("Query:", sql, "Params:", [usuarioId]);
      const [rows] = await connection.execute(sql, [usuarioId]);
      return rows[0].total_itens || 0;
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