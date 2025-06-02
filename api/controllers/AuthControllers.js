import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { read, create } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';

// Validações básicas essenciais
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validarCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.length === 11;
};

const registerController = async (req, res) => {
  try {
    const { name, email, cpf, turma, turno, senha } = req.body;

    // Verificar campos obrigatórios
    if (!name || !email || !cpf || !turma || !turno || !senha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    // Validações básicas
    if (!validarEmail(email)) {
      return res.status(400).json({ erro: 'Email inválido' });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF deve ter 11 dígitos' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se email já existe
    const usuarioExistente = await read('users', `email = ?`, [email.toLowerCase()]);
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Limpar CPF uma única vez
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verificar se CPF já existe
    const cpfExistente = await read('users', `cpf = ?`, [cpfLimpo]);
    if (cpfExistente) {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }

    // Hash da senha
    const hashedSenha = await bcrypt.hash(senha, 12);

    // Criar usuário
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      cpf: cpfLimpo,
      turma: turma.trim(),
      turno: turno.trim(),
      senha: hashedSenha
    };

    const userId = await create('users', userData);

    // Gerar token
    const token = jwt.sign(
      { id: userId }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      token,
      usuario: {
        id: userId,
        name: userData.name,
        email: userData.email,
        turma: userData.turma,
        turno: userData.turno
      }
    });

  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await read('users', `email = ?`, [email.toLowerCase()]);
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        turma: usuario.turma,
        turno: usuario.turno
      }
    });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

export { registerController, loginController };