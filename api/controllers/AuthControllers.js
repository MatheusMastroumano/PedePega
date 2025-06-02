import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { read, compare, create } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';

const registerController = async (req, res) => {
  const { name, email, cpf, turma, turno, senha } = req.body;

  try {
    const usuario = await read('users', `email = ?`, [email]);

    if (usuario) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }

    const usuarioCPF = await read('users', `cpf = ?`, [cpf]);

    if (usuarioCPF) {
      return res.status(400).json({mensagem: 'CPF já cadastrado'})
    }

    const saltRounds = 10;
    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    const userData = { name, email, cpf, turma, turno, senha: hashedSenha };
    const userId = await create('users', userData);

    const token = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: '3h',
    });

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso', token });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).json({ mensagem: 'Erro ao registrar usuário' });
  }
};

const loginController = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await read('users', `email = ?`, [email]);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    const senhaCorreta = await compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, {
      expiresIn: '3h',
    });

    res.json({ mensagem: 'Login realizado com sucesso', token });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
};

export { loginController, registerController };