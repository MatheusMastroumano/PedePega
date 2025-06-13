import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

// Função para gerar horários disponíveis
const gerarHorariosDisponiveis = () => {
  const horarios = [];
  // Intervalos de 15 minutos entre 7:00 e 12:35
  for (let hora = 7; hora <= 12; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 15) {
      // Pular horários após 12:35
      if (hora === 12 && minuto > 35) continue;
      
      const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horarios.push(horario);
    }
  }
  return horarios;
};

// Função para validar horário de retirada
const validarHorarioRetirada = async (horario) => {
  // Validar se o horário está em um dos intervalos permitidos
  const intervalos = [
    { inicio: '07:00', fim: '12:00' }, // Manhã
    { inicio: '12:01', fim: '17:00' }, // Tarde
    { inicio: '17:01', fim: '22:00' }  // Noite
  ];

  // Verificar se o horário está em algum dos intervalos
  return intervalos.some(intervalo => {
    const [horarioInicio, horarioFim] = horario.split('-');
    return horarioInicio === intervalo.inicio && horarioFim === intervalo.fim;
  });
};

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "PedePega",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testar conexão inicial
pool.getConnection()
  .then(connection => {
    console.log('Conexão com o banco de dados estabelecida com sucesso');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
    process.exit(1);
  });

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('Erro ao obter conexão do pool:', err);
    throw new Error('Erro ao conectar com o banco de dados');
  }
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
    throw new Error(`Erro ao ler registros da tabela ${table}: ${err.message}`);
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
    throw new Error(`Erro ao ler registro da tabela ${table}: ${err.message}`);
  } finally {
    connection.release();
  }
}

async function create(table, data) {
  const connection = await getConnection();
  try {
    const columns = Object.keys(data).join(", ");
    const placeholders = Array(Object.keys(data).length).fill("?").join(", ");
    const sql = `INSERT INTO ${mysql.escapeId(table)} (${columns}) VALUES (${placeholders})`;
    const values = Object.values(data);
    console.log("Query:", sql, "Params:", values);
    const [result] = await connection.execute(sql, values);
    return result.insertId;
  } catch (err) {
    console.error("Erro ao inserir registro:", err);
    throw new Error(`Erro ao inserir registro na tabela ${table}: ${err.message}`);
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
    console.error("Erro ao atualizar registro:", err);
    throw new Error(`Erro ao atualizar registro na tabela ${table}: ${err.message}`);
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
    console.error("Erro ao excluir registro:", err);
    throw new Error(`Erro ao excluir registro da tabela ${table}: ${err.message}`);
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

export { 
  readAll, 
  read, 
  create, 
  update, 
  deleteRecord, 
  compare, 
  getConnection,
  validarHorarioRetirada,
  gerarHorariosDisponiveis 
};
