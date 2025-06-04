import { getConnection } from "../config/database.js";

const criarPedido = async (usuarioId, itens, total) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "INSERT INTO pedidos (id_usuario, data, horario_pedido, status) VALUES (?, NOW(), CURTIME(), 'Pendente')",
      [usuarioId]
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
  const connection = getConnection();

  try {
    const [pedidoExistente] = await connection.execute(
      "SELECT id_pedido, status FROM pedidos WHERE id_pedido = ? AND id_usuario = ?",
      [pedidoId, usuarioId]
    );

    if (pedidoExistente.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    if (pedidoExistente[0].status === "Finalizado") {
      throw new Error("Pedido já foi finalizado");
    }

    await connection.execute(
      "UPDATE pedidos SET status = 'Finalizado', data_finalizacao = NOW() WHERE id_pedido = ?",
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

const listarPedidosPorUsuario = async (
  usuarioId,
  incluirFinalizados = true
) => {
  let sql = `
        SELECT * FROM pedidos
        WHERE id_usuario = ?
    `;

  //Opção para filtrar pedidos finalizados
  if (!incluirFinalizados) {
    sql += "AND status != 'Finalizado'";
  }

  sql += "ORDER BY data DESC";

  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, [usuarioId]);
    return rows;
  } finally {
    connection.release();
  }
};

const listarPedidosAtivos = async (usuarioId) => {
  const sql = `
    SELECT *FROM pedidos
    WHERE id_usuario = ? AND status IN ('Pendente', 'Em_Preparo', 'Pronto')
    ORDER BY data DESC
    `;

  const connection = getConnection();
  try {
    const [rows] = await connection.execute(sql, [usuarioId]);
    return rows;
  } finally {
    connection.release();
  }
};

//Função para admin
const listarTodosPedidosAtivos = async () => {
  const sql = `
        SELECT p.*, u.nome as nome_usuario, u.email
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.status IN ('Pendente', 'Em_Preparo', 'Pronto')
        ORDER BY p.data DESC
    `;
  const connection = getConnection();

  try {
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release;
  }
};

//Função para admin
const alterarStatusPedido = async (pedidoId, novoStatus) => {
  const connection = getConnection();

  try {
    const statusValidos = [
      "Pendente",
      "Em_Preparo",
      "Pronto",
      "Finalizado",
      "Cancelado",
    ];

    if (!statusValidos.includes(novoStatus)) {
      throw new Error("Status inválido");
    }

    await connection.execute(
      "UPDATE pedidos SET status = ? WHERE id_pedido = ?",
      [novoStatus, pedidoId]
    );

    return true;
  } catch (err) {
    console.error("Erro ao alterar status do pedido", err);
    throw err;
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
