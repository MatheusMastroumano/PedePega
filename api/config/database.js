import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "PedePega",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getConnection() {
  return pool.getConnection();
}

async function readAll(table, where = null, params = []) {
  const connection = await getConnection();
  try {
    let sql = `SELECT * FROM ${mysql.escapeId(table)}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    console.log("Query:", sql, "Params:", params);
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("Erro ao ler registros:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function read(table, where = null, params = []) {
  const connection = await getConnection();
  try {
    let sql = `SELECT * FROM ${mysql.escapeId(table)}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    console.log("Query:", sql, "Params:", params);
    const [rows] = await connection.execute(sql, params);
    return rows[0] || null;
  } catch (err) {
    console.error("Erro ao ler registro:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function create(table, data) {
  const connection = await getConnection();
  try {
    const columns = Object.keys(data).join(", ");
    const placeholders = Array(Object.keys(data).length).fill("?").join(", ");
    const sql = `INSERT INTO ${mysql.escapeId(
      table
    )} (${columns}) VALUES (${placeholders})`;
    const values = Object.values(data);
    console.log("Query:", sql, "Params:", values);
    const [result] = await connection.execute(sql, values);
    return result.insertId;
  } catch (err) {
    console.error("Erro ao inserir registros:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function update(table, data, where, params = []) {
  const connection = await getConnection();
  try {
    const set = Object.keys(data)
      .map((column) => `${mysql.escapeId(column)} = ?`)
      .join(", ");
    const sql = `UPDATE ${mysql.escapeId(table)} SET ${set} WHERE ${where}`;
    const values = [...Object.values(data), ...params];
    console.log("Query:", sql, "Params:", values);
    const [result] = await connection.execute(sql, values);
    return result.affectedRows;
  } catch (err) {
    console.error("Erro ao atualizar registros:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteRecord(table, where, params = []) {
  const connection = await getConnection();
  try {
    const sql = `DELETE FROM ${mysql.escapeId(table)} WHERE ${where}`;
    console.log("Query:", sql, "Params:", params);
    const [result] = await connection.execute(sql, params);
    return result.affectedRows;
  } catch (err) {
    console.error("Erro ao excluir registros:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function compare(senha, hash) {
  try {
    return await bcrypt.compare(senha, hash);
  } catch (err) {
    console.error("Erro ao comparar senha com hash:", err);
    throw err;
  }
}

export { readAll, read, create, update, deleteRecord, compare, getConnection };
