import { getConnection } from "../config/database.js";
import bcrypt from "bcrypt";

const criarUsuario = async (userData) => {
  const { name, email, senha, cpf, turma, turno } = userData;
  const connection = await getConnection();

  try {
    // Verificar se o email já existe
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      throw new Error("Email já cadastrado");
    }

    // Verificar se o CPF já existe
    if (cpf) {
      const [existingCPF] = await connection.execute(
        "SELECT id FROM users WHERE cpf = ?",
        [cpf]
      );

      if (existingCPF.length > 0) {
        throw new Error("CPF já cadastrado");
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, senha, cpf, turma, turno, tipo) 
       VALUES (?, ?, ?, ?, ?, ?, 'usuario')`,
      [name, email, hashedPassword, cpf, turma, turno]
    );

    return result.insertId;
  } finally {
    connection.release();
  }
};

const buscarUsuarioPorEmail = async (email) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return users[0];
  } finally {
    connection.release();
  }
};

const buscarUsuarioPorId = async (id) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute(
      "SELECT id, name, email, cpf, turma, turno, tipo FROM users WHERE id = ?",
      [id]
    );
    return users[0];
  } finally {
    connection.release();
  }
};

const atualizarUsuario = async (id, userData) => {
  const { name, email, senha, cpf, turma, turno } = userData;
  const connection = await getConnection();

  try {
    // Verificar se o email já existe para outro usuário
    if (email) {
      const [existingEmail] = await connection.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );

      if (existingEmail.length > 0) {
        throw new Error("Email já cadastrado para outro usuário");
      }
    }

    // Verificar se o CPF já existe para outro usuário
    if (cpf) {
      const [existingCPF] = await connection.execute(
        "SELECT id FROM users WHERE cpf = ? AND id != ?",
        [cpf, id]
      );

      if (existingCPF.length > 0) {
        throw new Error("CPF já cadastrado para outro usuário");
      }
    }

    // Preparar campos para atualização
    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      updates.push("senha = ?");
      values.push(hashedPassword);
    }
    if (cpf) {
      updates.push("cpf = ?");
      values.push(cpf);
    }
    if (turma) {
      updates.push("turma = ?");
      values.push(turma);
    }
    if (turno) {
      updates.push("turno = ?");
      values.push(turno);
    }

    if (updates.length === 0) {
      throw new Error("Nenhum dado para atualizar");
    }

    values.push(id);

    const [result] = await connection.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

const verificarCredenciais = async (email, senha) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tipo: user.tipo,
      turma: user.turma,
      turno: user.turno
    };
  } finally {
    connection.release();
  }
};

export {
  criarUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  atualizarUsuario,
  verificarCredenciais
}; 