import {
  listarProdutos,
  obterProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from "../models/Produto.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const listarProdutosController = async (req, res) => {
  try {
    const produtos = await listarProdutos();
    res.json(produtos);
  } catch (err) {
    console.error("Erro ao listar produtos: ", err);
    res.status(500).json({ mensagem: "Erro ao listar produto" });
  }
};

const obterProdutoPorIdController = async (req, res) => {
  try {
    const produto = await obterProdutoPorId(req.params.id);
    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao obter produto por ID: ", err);
    res.status(500).json({ mensagem: "Erro ao obter produto por ID" });
  }
};

const criarProdutoController = async (req, res) => {
  try {
    const { nome, preco, disponivel, estoque } = req.body;
    let imagemPath = null;

    // Se há arquivo enviado (capa)
    if (req.file) {
      // Salvar apenas o caminho relativo no banco
      imagemPath = `uploads/produtos/${req.file.filename}`;
    }

    const produtoData = {
      nome: nome,
      preco: parseFloat(preco),
      estoque: parseInt(estoque) || 0,
      imagemPath: imagemPath,
    };

    console.log("Dados do produto a ser criado:", produtoData);

    const produtoId = await criarProduto(produtoData);
    res.status(201).json({
      mensagem: "Produto criado com sucesso",
      produtoId,
      produto: { ...produtoData, id_produto: produtoId },
    });
  } catch (err) {
    console.error("Erro ao criar produto: ", err);

    // Remove a imagem se houver erro na criação
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Erro ao remover arquivo após falha:", unlinkErr);
      }
    }

    res.status(500).json({ mensagem: "Erro ao criar produto" });
  }
};

const atualizarProdutoController = async (req, res) => {
  try {
    const produtoId = req.params.id;
    const { nome, preco, estoque } = req.body;

    // Buscar produto atual para manter dados existentes
    const produtoAtual = await obterProdutoPorId(produtoId);
    if (!produtoAtual) {
      // Remove arquivo enviado se produto não existe
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Erro ao remover arquivo:", err);
        }
      }
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    let imagemPath = produtoAtual.imagemPath; // Manter imagem atual por padrão

    // Se foi enviada uma nova imagem
    if (req.file) {
      // Remover imagem antiga se existir
      if (produtoAtual.imagemPath) {
        const caminhoImagemAntiga = path.join(
          __dirname,
          "..",
          produtoAtual.imagemPath
        );
        try {
          if (fs.existsSync(caminhoImagemAntiga)) {
            fs.unlinkSync(caminhoImagemAntiga);
            console.log("Imagem antiga removida:", caminhoImagemAntiga);
          }
        } catch (err) {
          console.error("Erro ao remover imagem antiga:", err);
        }
      }

      // Definir nova imagem
      imagemPath = `uploads/produtos/${req.file.filename}`;
    }

    const produtoData = {
      nome: nome || produtoAtual.nome,
      preco: preco ? parseFloat(preco) : produtoAtual.preco,
      estoque: estoque !== undefined ? parseInt(estoque) : produtoAtual.estoque,
      imagemPath: imagemPath,
    };

    console.log("Dados do produto a ser atualizado:", produtoData);

    await atualizarProduto(produtoId, produtoData);
    res.status(200).json({
      mensagem: "Produto atualizado com sucesso",
      produto: { ...produtoData, id_produto: produtoId },
    });
  } catch (err) {
    console.error("Não foi possível atualizar o produto", err);

    // Remove arquivo enviado se houve erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Erro ao remover arquivo após falha:", unlinkErr);
      }
    }

    res.status(500).json({ mensagem: "Erro ao atualizar produto" });
  }
};

const deletarProdutoController = async (req, res) => {
  try {
    const produtoId = req.params.id;

    // Buscar produto para obter caminho da imagem
    const produto = await obterProdutoPorId(produtoId);
    if (!produto) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    // Deletar produto do banco primeiro
    await deletarProduto(produtoId);

    // Remover imagem do sistema de arquivos
    if (produto.imagemPath) {
      const caminhoImagem = path.join(__dirname, "..", produto.imagemPath);
      try {
        if (fs.existsSync(caminhoImagem)) {
          fs.unlinkSync(caminhoImagem);
          console.log("Imagem removida:", caminhoImagem);
        }
      } catch (err) {
        console.error("Erro ao remover imagem:", err);
        // Não falha a operação se não conseguir remover a imagem
      }
    }

    res.status(200).json({ mensagem: "Produto deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ mensagem: "Erro ao deletar produto" });
  }
};

export {
  listarProdutosController,
  obterProdutoPorIdController,
  criarProdutoController,
  atualizarProdutoController,
  deletarProdutoController,
};
