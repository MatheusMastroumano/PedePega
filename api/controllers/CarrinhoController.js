import {
    obterCarrinho,
    adicionarItemCarrinho,
    atualizarQuantidadeItem,
    removerItemCarrinho,
    limparCarrinho,
    calcularTotalCarrinho,
    contarItensCarrinho,
  } from "../models/Carrinho.js";
  
  const obterCarrinhoController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      console.log("Obtendo carrinho para usuarioId:", usuarioId);
      const carrinho = await obterCarrinho(usuarioId);
      const total = await calcularTotalCarrinho(usuarioId);
      res.json({
        carrinho,
        total: parseFloat(total || 0),
      });
    } catch (err) {
      console.error("Erro ao obter carrinho:", err);
      res.status(500).json({ mensagem: "Erro ao obter carrinho" });
    }
  };
  
  const adicionarItemController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { produtoId, quantidade = 1 } = req.body;
  
      console.log("Adicionando item:", { usuarioId, produtoId, quantidade });
  
      if (!produtoId) {
        return res.status(400).json({ mensagem: "ID do produto é obrigatório" });
      }
  
      if (quantidade <= 0) {
        return res.status(400).json({ mensagem: "Quantidade deve ser maior que zero" });
      }
  
      const resultado = await adicionarItemCarrinho(usuarioId, produtoId, quantidade);
  
      if (resultado.erro) {
        if (resultado.erro === "Produto não encontrado") {
          return res.status(404).json({ mensagem: "Produto não encontrado" });
        }
        if (resultado.erro === "Produto não está disponível") {
          return res.status(400).json({ mensagem: "Produto não está disponível" });
        }
        if (
          resultado.erro === "Estoque insuficiente" ||
          resultado.erro === "Estoque insuficiente para a nova quantidade"
        ) {
          return res.status(400).json({ mensagem: resultado.erro });
        }
      }
  
      res.status(201).json({ mensagem: "Item adicionado ao carrinho com sucesso" });
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho:", err);
      res.status(500).json({ mensagem: "Erro ao adicionar item ao carrinho" });
    }
  };
  
  const atualizarQuantidadeController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const itemId = req.params.id;
      const { quantidade } = req.body;
  
      console.log("Atualizando item:", { usuarioId, itemId, quantidade });
  
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ mensagem: "Quantidade deve ser maior que zero" });
      }
  
      const resultado = await atualizarQuantidadeItem(usuarioId, itemId, quantidade);
  
      if (resultado === 0) {
        return res.status(404).json({ mensagem: "Item não encontrado no carrinho" });
      }
  
      if (resultado.erro) {
        if (resultado.erro === "Produto não encontrado") {
          return res.status(404).json({ mensagem: "Produto não encontrado" });
        }
        if (resultado.erro === "Produto não está disponível") {
          return res.status(400).json({ mensagem: "Produto não está disponível" });
        }
        if (resultado.erro === "Estoque insuficiente") {
          return res.status(400).json({ mensagem: "Estoque insuficiente" });
        }
      }
  
      res.json({ mensagem: "Quantidade atualizada com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      res.status(500).json({ mensagem: "Erro ao atualizar quantidade" });
    }
  };
  
  const removerItemController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const itemId = req.params.id;
  
      const affectedRows = await removerItemCarrinho(usuarioId, itemId);
  
      if (affectedRows === 0) {
        return res.status(404).json({ mensagem: "Item não encontrado no carrinho" });
      }
  
      res.json({ mensagem: "Item removido do carrinho com sucesso" });
    } catch (err) {
      console.error("Erro ao remover item do carrinho:", err);
      res.status(500).json({ mensagem: "Erro ao remover item do carrinho" });
    }
  };

  const limparCarrinhoController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
  
      await limparCarrinho(usuarioId);
  
      res.json({ mensagem: "Carrinho limpo com sucesso" });
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
      res.status(500).json({ mensagem: "Erro ao limpar carrinho" });
 }
  };
  
  const contarItensCarrinhoController = async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
  
      const totalItens = await contarItensCarrinho(usuarioId);
  
      res.json({ total_itens: parseInt(totalItens) });
    } catch (err) {
      console.error("Erro ao contar itens do carrinho:", err);
      res.status(500).json({ mensagem: "Erro ao contar itens do carrinho" });
    }
  };

  export {
    obterCarrinhoController,
    adicionarItemController,
    atualizarQuantidadeController,
    removerItemController,
    limparCarrinhoController,
    contarItensCarrinhoController,
  };