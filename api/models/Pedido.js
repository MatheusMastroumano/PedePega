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

<<<<<<< Updated upstream
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
=======
const listarPedidosPorUsuario = async (usuarioId, incluirFinalizados = true) => {
  const connection = await getConnection();
  try {
    // Primeiro, buscar os pedidos
    let sql = `
      SELECT p.*, 
             COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) as total
      FROM pedidos p
      LEFT JOIN item_pedido ip ON p.id_pedido = ip.id_pedido
      WHERE p.id_usuario = ?
    `;

    if (!incluirFinalizados) {
      sql += " AND p.status != 'Finalizado'";
    }

    sql += " GROUP BY p.id_pedido ORDER BY p.data DESC";

    const [pedidos] = await connection.execute(sql, [usuarioId]);

    // Para cada pedido, buscar seus itens
    for (let pedido of pedidos) {
      const [itens] = await connection.execute(`
        SELECT ip.*, pr.nome as nome_produto
        FROM item_pedido ip
        JOIN produtos pr ON ip.id_produto = pr.id_produto
        WHERE ip.id_pedido = ?
      `, [pedido.id_pedido]);
      
      pedido.itens = itens;
    }

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    const [pedidos] = await connection.execute(
      `SELECT p.*, u.name as nome_usuario, u.turma, u.turno
       FROM pedidos p 
       JOIN users u ON p.id_usuario = u.id 
       WHERE p.status IN ('Pendente', 'Em Preparo', 'Pronto')
       ORDER BY p.data DESC, p.horario_retirada ASC`
    );
    return pedidos;
=======
    const sql = `
      SELECT p.*, 
             u.name AS name_usuario, 
             u.email,
             COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) as total
      FROM pedidos p
      JOIN users u ON p.id_usuario = u.id
      LEFT JOIN item_pedido ip ON p.id_pedido = ip.id_pedido
      WHERE p.status NOT IN ('Finalizado', 'Cancelado')
      GROUP BY p.id_pedido
      ORDER BY p.data DESC
    `;

    const [pedidos] = await connection.execute(sql);

    // Para cada pedido, buscar seus itens
    for (let pedido of pedidos) {
      const [itens] = await connection.execute(`
        SELECT ip.*, pr.nome as nome_produto
        FROM item_pedido ip
        JOIN produtos pr ON ip.id_produto = pr.id_produto
        WHERE ip.id_pedido = ?
      `, [pedido.id_pedido]);
      
      pedido.itens = itens;
    }

    return pedidos;
  } catch (error) {
    console.error('Erro ao listar pedidos ativos:', error);
    throw error;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    const statusValidos = [
      "Pendente",
      "Em Preparo",
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
>>>>>>> Stashed changes
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const obterItensDoPedido = async (pedidoId) => {
<<<<<<< Updated upstream
  const sql = `
    SELECT item_pedido.*, produtos.nome, produtos.preco, produtos.id_produto
    FROM item_pedido
    JOIN produtos ON item_pedido.id_produto = produtos.id_produto
    WHERE id_pedido = ?
  `;
=======
>>>>>>> Stashed changes
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT ip.*, pr.nome as nome_produto, pr.preco, pr.id_produto
      FROM item_pedido ip
      JOIN produtos pr ON ip.id_produto = pr.id_produto
      WHERE ip.id_pedido = ?
    `, [pedidoId]);
    return rows;
  } finally {
    connection.release();
  }
};

const listarTodosPedidos = async () => {
  const connection = await getConnection();
  try {
    const sql = `
      SELECT p.*, 
             u.name AS name_usuario, 
             u.email,
             COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) as total
      FROM pedidos p
      JOIN users u ON p.id_usuario = u.id
      LEFT JOIN item_pedido ip ON p.id_pedido = ip.id_pedido
      GROUP BY p.id_pedido
      ORDER BY p.data DESC
    `;

    const [pedidos] = await connection.execute(sql);

    // Para cada pedido, buscar seus itens
    for (let pedido of pedidos) {
      const [itens] = await connection.execute(`
        SELECT ip.*, pr.nome as nome_produto
        FROM item_pedido ip
        JOIN produtos pr ON ip.id_produto = pr.id_produto
        WHERE ip.id_pedido = ?
      `, [pedido.id_pedido]);
      
      pedido.itens = itens;
    }

    return pedidos;
  } finally {
    connection.release();
  }
};

const listarStatusUnicos = async () => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT DISTINCT status FROM pedidos');
    console.log('Status únicos encontrados:', rows);
    return rows;
  } finally {
    connection.release();
  }
};

const atualizarPedidosSemStatus = async () => {
  const connection = await getConnection();
  try {
    await connection.execute(
      "UPDATE pedidos SET status = 'Pendente' WHERE status = '' OR status IS NULL"
    );
    return true;
  } catch (error) {
    console.error('Erro ao atualizar pedidos sem status:', error);
    throw error;
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
  listarTodosPedidos,
  listarStatusUnicos,
  atualizarPedidosSemStatus,
};
