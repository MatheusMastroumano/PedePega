import {
  readAll,
  read,
  create,
  update,
  deleteRecord,
} from "../config/database.js";

const obterCarrinho = async (usuarioId) => {
  try {
    return await readAll(
      "carrinho_item JOIN produto ON carrinho_item.id_produto = produto.id_produto",
      "carrinho_item.id_usuario = ? AND produto.disponivel = 1",
      [usuarioId]
    );
  } catch (err) {
    console.error("Erro ao obter carrinho...", err);
    throw err;
  }
};

const adicionarItemCarrinho = async (usuarioId, produtoId, quantidade) => {
  try {
    //verifica produto (existe/disponivel)
    const produto = await read("produto", "id_produto = ?", produtoId);

    if (!produto) {
      return { mensagem: "Produto não existe" };
    }

    if (!produto.disponivel) {
      return { mensagem: "Produto não disponível" };
    }

    //verifica se ja esta no carrinho
    const itemExistente = await read(
      "carrinho_item",
      "id_usuario = ? AND id_produto = ?",
      [usuarioId, produtoId]
    );

    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      return await update(
        "carrinho_item",
        { quantidade: novaQuantidade },
        "id_carrinho_item = ?",
        [itemExistente.id_carrinho_item]
      );
    } else {
      //cria novo item carrinho
      const itemData = {
        id_usuario: usuarioId,
        id_produto: produtoId,
        quantidade: quantidade,
      };

      return await create("carrinho_item", itemData);
    }
  } catch (err) {
    console.error("Erro ao adicionar item ao carrinho", err);
    throw err;
  }
};

const atualizarQuantidadeItem = async (usuarioId, itemId, quantidade) => {
  try {
    return await update(
      "carrinho_item",
      { quantidade: quantidade },
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
    return await deleteRecord(
      "carrinho_item",
      "id_carrinho_item = ? AND id_usuario",
      [itemId, usuarioId]
    );
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    throw err;
  }
};

const limparCarrinho = async (usuarioId) => {
  try {
    return await deleteRecord("carrinho_item", "id_usuario = ?", [usuarioId]);
  } catch (err) {
    console.error("Erro ao limpar carrinho:", err);
    throw err;
  }
};

const calcularTotalCarrinho = async (usuarioId) => {
  try {
    const items = await readAll(
      "carrinho_item JOIN produto ON carrinho_item.id_produto = produto.id_produto",
      "carrinho_item.id_usuario = ? ANd produto.disponivel = 1",
      [usuarioId]
    );
    return items.reduce((total, item) => {
      return total + item.quantidade * parseFloat(item.preco);
    }, 0);
  } catch (err) {
    console.error("Erro ao calcular total:", err);
    throw err;
  }
};

const contarItensCarrinho = async (usuarioId) => {
  try {
    const items = await readAll("carrinho_item", "id_usuario = ?", [usuarioId]);
    return items.reduce((total, item) => total + item.quantidade, 0);
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
