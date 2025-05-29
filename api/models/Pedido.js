import { create, read, readAll, update, getConnection } from '../config/database.js';

const criarPedido = async (pedidoData) => {
  try {
    console.log('Criando pedido:', pedidoData);
    const pedidoId = await create('pedido', pedidoData);
    console.log('Pedido criado com ID:', pedidoId);
    return pedidoId;
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    throw err;
  }
};

const obterPedidoPorId = async (pedidoId, usuarioId) => {
  try {
    const connection = await getConnection();
    try {
      // Buscar pedido com itens
      const sql = `
        SELECT 
          p.id_pedido,
          p.id_usuario,
          p.total,
          p.status,
          p.forma_pagamento,
          p.data_pedido,
          pi.id_produto,
          pi.quantidade,
          pi.preco_unitario,
          pi.subtotal,
          prod.nome as produto_nome,
          prod.imagemPath
        FROM pedido p
        LEFT JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
        LEFT JOIN produto prod ON pi.id_produto = prod.id_produto
        WHERE p.id_pedido = ? AND p.id_usuario = ?
      `;
      
      const [rows] = await connection.execute(sql, [pedidoId, usuarioId]);
      
      if (rows.length === 0) {
        return null;
      }

      // Organizar os dados
      const pedido = {
        id_pedido: rows[0].id_pedido,
        id_usuario: rows[0].id_usuario,
        total: parseFloat(rows[0].total),
        status: rows[0].status,
        forma_pagamento: rows[0].forma_pagamento,
        data_pedido: rows[0].data_pedido,
        itens: []
      };

      // Adicionar itens se existirem
      if (rows[0].id_produto) {
        pedido.itens = rows.map(row => ({
          id_produto: row.id_produto,
          nome: row.produto_nome,
          quantidade: row.quantidade,
          preco_unitario: parseFloat(row.preco_unitario),
          subtotal: parseFloat(row.subtotal),
          imagem: row.imagemPath
        }));
      }

      return pedido;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Erro ao obter pedido por ID:', err);
    throw err;
  }
};

const listarPedidosUsuario = async (usuarioId) => {
  try {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT 
          p.id_pedido,
          p.total,
          p.status,
          p.forma_pagamento,
          p.data_pedido,
          COUNT(pi.id_produto) as total_itens
        FROM pedido p
        LEFT JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
        WHERE p.id_usuario = ?
        GROUP BY p.id_pedido
        ORDER BY p.data_pedido DESC
      `;
      
      const [rows] = await connection.execute(sql, [usuarioId]);
      
      return rows.map(row => ({
        id_pedido: row.id_pedido,
        total: parseFloat(row.total),
        status: row.status,
        forma_pagamento: row.forma_pagamento,
        data_pedido: row.data_pedido,
        total_itens: row.total_itens
      }));
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Erro ao listar pedidos do usuário:', err);
    throw err;
  }
};

const atualizarStatusPedido = async (pedidoId, novoStatus) => {
  try {
    console.log('Atualizando status do pedido:', { pedidoId, novoStatus });
    const result = await update('pedido', { status: novoStatus }, 'id_pedido = ?', [pedidoId]);
    console.log('Status do pedido atualizado');
    return result;
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    throw err;
  }
};

export {
  criarPedido,
  obterPedidoPorId,
  listarPedidosUsuario,
  atualizarStatusPedido
};