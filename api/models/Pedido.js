import { getConnection } from "../config/database.js";

const criarPedido = async (usuarioId, itens, total) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "INSERT INTO pedido (id_usuario, data, horario_pedido, status) VALUES (?, NOW(), CURTIME(), 'Pendente')",
      [usuarioId]
    );

    const pedidoId = result.insertId;

    for (const item of itens) {
      await connection.execute(
        `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`,
        [pedidoId, item.id_produto, item.quantidade, item.preco]
      );
    }

    await connection.commit();
    return pedidoId;
  } catch (err) {
    await connection.rollback();
    console.error("Erro ao criar pedido", err);
    throw err;
  } finally {
    connection.release();
  }
};

const listarPedidosPorUsuario = async (usuarioId) => {
  const sql = `
    SELECT *FROM pedido
    WHERE id_usuario = ?
    ORDER BY data DESC
    `;

  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(sql, [usuarioId]);
    return rows;
  } finally {
    connection.release();
  }
};

const obterItensDoPedido = async (pedidoId) => {
  const sql = `
    SELECT item_pedido.*, produto.nome, produto.preco, produto.id_produto
    FROM item_pedido
    JOIN produto ON item_pedido.id_produto = produto.id_produto
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

export { criarPedido, listarPedidosPorUsuario, obterItensDoPedido };
