import { getConnection, validarHorarioRetirada } from "../config/database.js";

const criarPedido = async (usuarioId, itens, total, dataRetirada, horarioRetirada, formaPagamento, dadosCartao) => {
  // Validar horário de retirada
  const horarioValido = await validarHorarioRetirada(horarioRetirada);
  if (!horarioValido) {
    throw new Error('Horário de retirada inválido');
  }

  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO pedidos (
        id_usuario, 
        data, 
        horario_pedido, 
        status, 
        total,
        data_retirada,
        horario_retirada,
        forma_pagamento,
        dados_cartao
      ) VALUES (?, NOW(), CURTIME(), 'Pendente', ?, ?, ?, ?, ?)`,
      [
        usuarioId, 
        total, 
        dataRetirada, 
        horarioRetirada,
        formaPagamento,
        dadosCartao ? JSON.stringify(dadosCartao) : null
      ]
    );
    const pedidoId = result.insertId;

    for (const item of itens) {
      await connection.execute(
        `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) 
         VALUES (?, ?, ?, ?)`,
        [pedidoId, item.id_produto, item.quantidade, item.preco]
      );
    }

    await connection.commit();
    return pedidoId;
  } catch (err) {
    await connection.rollback();
    console.error("Erro ao criar pedido:", err);
    throw err;
  } finally {
    connection.release();
  }
};

const finalizarPedido = async (pedidoId, usuarioId) => {
  const connection = await getConnection();

  try {
    const [pedidoExistente] = await connection.execute(
      "SELECT id_pedido, status FROM pedidos WHERE id_pedido = ? AND id_usuario = ?",
      [pedidoId, usuarioId]
    );

    if (pedidoExistente.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    if (pedidoExistente[0].status === "Entregue") {
      throw new Error("Pedido já foi entregue");
    }

    await connection.execute(
      "UPDATE pedidos SET status = 'Entregue', data_finalizacao = NOW() WHERE id_pedido = ?",
      [pedidoId]
    );

    return true;
  } catch (err) {
    console.error("Erro ao finalizar pedido", err);
    throw err;
  } finally {
    await connection.release();
  }
};

const cancelarPedido = async (pedidoId, usuarioId) => {
  const connection = await getConnection();

  try {
    const [pedidoExistente] = await connection.execute(
      "SELECT id_pedido, status FROM pedidos WHERE id_pedido = ? AND id_usuario = ?",
      [pedidoId, usuarioId]
    );

    if (pedidoExistente.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    if (pedidoExistente[0].status !== "Pendente") {
      throw new Error("Apenas pedidos pendentes podem ser cancelados");
    }

    await connection.execute(
      "UPDATE pedidos SET status = 'Cancelado', data_cancelamento = NOW() WHERE id_pedido = ?",
      [pedidoId]
    );

    return true;
  } catch (err) {
    console.error("Erro ao cancelar pedido", err);
    throw err;
  } finally {
    connection.release();
  }
};

const listarPedidosPorUsuario = async (usuarioId) => {
  const connection = await getConnection();
  try {
    const [pedidos] = await connection.execute(
      `SELECT p.*, u.name as nome_usuario, u.turma, u.turno
       FROM pedidos p 
       JOIN users u ON p.id_usuario = u.id 
       WHERE p.id_usuario = ? 
       ORDER BY p.data DESC`,
      [usuarioId]
    );
    return pedidos;
  } finally {
    connection.release();
  }
};

const listarPedidosAtivos = async (usuarioId) => {
  const sql = `
    SELECT p.*, u.name as nome_usuario, u.turma, u.turno
    FROM pedidos p
    JOIN users u ON p.id_usuario = u.id
    WHERE p.id_usuario = ? AND p.status IN ('Pendente', 'Em Preparo', 'Pronto')
    ORDER BY p.data DESC, p.horario_retirada ASC
    `;

  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, [usuarioId]);
    return rows;
  } finally {
    connection.release();
  }
};

const listarTodosPedidosAtivos = async () => {
  const connection = await getConnection();
  try {
    const [pedidos] = await connection.execute(
      `SELECT p.*, u.name as nome_usuario, u.turma, u.turno
       FROM pedidos p 
       JOIN users u ON p.id_usuario = u.id 
       WHERE p.status IN ('Pendente', 'Em Preparo', 'Pronto')
       ORDER BY p.data DESC, p.horario_retirada ASC`
    );
    return pedidos;
  } finally {
    connection.release();
  }
};

const alterarStatusPedido = async (pedidoId, status) => {
  const statusValidos = ['Pendente', 'Em Preparo', 'Pronto', 'Entregue', 'Cancelado'];
  if (!statusValidos.includes(status)) {
    throw new Error('Status inválido');
  }

  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      `UPDATE pedidos 
       SET status = ?, 
           data_finalizacao = CASE 
             WHEN ? = 'Entregue' THEN NOW() 
             ELSE data_finalizacao 
           END,
           data_cancelamento = CASE 
             WHEN ? = 'Cancelado' THEN NOW() 
             ELSE data_cancelamento 
           END
       WHERE id_pedido = ?`,
      [status, status, status, pedidoId]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const obterItensDoPedido = async (pedidoId) => {
  const sql = `
    SELECT item_pedido.*, produtos.nome, produtos.preco, produtos.id_produto
    FROM item_pedido
    JOIN produtos ON item_pedido.id_produto = produtos.id_produto
    WHERE id_pedido = ?
  `;
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, [pedidoId]);
    return rows;
  } finally {
    connection.release();
  }
};

export {
  criarPedido,
  finalizarPedido,
  cancelarPedido,
  listarPedidosPorUsuario,
  listarPedidosAtivos,
  listarTodosPedidosAtivos,
  alterarStatusPedido,
  obterItensDoPedido,
};
