import mysql from 'mysql2/promise';
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'PedePega',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function getConnection() {
    return pool.getConnection();
}

//Função para ler todos os registros
async function readAll(table, where = null) {
    const connection = await getConnection();
    try {
        let sql = `SELECT * FROM ${table}`;
        if (where) {
            sql += ` WHERE ${where}`
        }

        const [rows] = await connection.execute(sql);
        return rows;
    } catch (err) {
        console.error('Erro ao ler registros: ', err);
        throw err;
    } finally {
        connection.release();
    }

}

//Função para ler  um registro específico
async function read(table, where) {
    const connection = await getConnection();
    try {
        let sql = `SELECT * FROM ${table}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }

        const [rows] = await connection.execute(sql);
        return rows[0] || null;
    } catch (err) {
        console.error('Erro ao ler registros: ', err);
        throw err;
    } finally {
        connection.release();
    }
}

//Função para inserir dados
async function create(table, data) {
    const connection = await getConnection();
    try {
        const columns = Object.keys(data).join(', ');
        

        const placeholders = Array(Object.keys(data).length).fill('?').join(', ');
        

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        

        const values = Object.values(data);

        const [result] = await connection.execute(sql, values);

        return result.insertId;
    } catch (err) {
        console.error('Erro ao inserir registros: ', err);
        throw err;
    } finally {
        connection.release();
    }
}

//Função para atualizar um registro
async function update(table, data, where) {
    const connection = await getConnection();
    try {
        const set = Object.keys(data)
            .map(column => `${column} = ?`)
            .join(', ');

        const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
        const values = Object.values(data);

        const [result] = await connection.execute(sql, [...values]);
        return result.affectedRows;
    } catch (err) {
        console.error('Erro ao atualizar registros: ', err);
        throw err;
    } finally {
        connection.release();
    }
}

// Função para excluir um registro
async function deleteRecord(table, where) {
    const connection = await getConnection();
    try {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const [result] = await connection.execute(sql);
        return result.affectedRows;
    } catch (err) {
        console.error('Erro ao excluir registros: ', err);
        throw err;
    } finally {
        connection.release();
    }
}

async function compare (senha, hash) {
    try {
        return await bcrypt.compare(senha, hash);
    } catch (err) {
        console.error('Erro ao comparar senha com hash: ', err);
    }
}

export { readAll, read, create, update, deleteRecord, compare};