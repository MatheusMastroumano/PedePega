import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { read, create } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';

// Função para validar email
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para validar CPF
const validarCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.length === 11;
};

// Função para validar senha segura
const validarSenhaSegura = (senha) => {
  const erros = [];
  
  // Verificar comprimento mínimo
  if (senha.length < 8) {
    erros.push('deve ter no mínimo 8 caracteres');
  }
  
  // Verificar letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    erros.push('deve conter pelo menos uma letra maiúscula');
  }
  
  // Verificar letra minúscula
  if (!/[a-z]/.test(senha)) {
    erros.push('deve conter pelo menos uma letra minúscula');
  }
  
  // Verificar número
  if (!/\d/.test(senha)) {
    erros.push('deve conter pelo menos um número');
  }
  
  // Verificar caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(senha)) {
    erros.push('deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  return {
    valida: erros.length === 0,
    erros
  };
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
    
    // Validação da senha segura
    const validacaoSenha = validarSenhaSegura(senha);
    if (!validacaoSenha.valida) {
      return res.status(400).json({ 
        erro: `Senha inválida. A senha ${validacaoSenha.erros.join(', ')}.`
      });
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
      senha: hashedSenha,
      tipo: 'usuario' // Definindo tipo padrão como 'usuario'
    };
    
    const userId = await create('users', userData);
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: userId,
        tipo: userData.tipo
      },
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
        turno: userData.turno,
        tipo: userData.tipo
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

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = await read('users', `email = ?`, [email.toLowerCase()]);
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { 
        id: usuario.id,
        tipo: usuario.tipo || 'usuario'
      }, 
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
        turno: usuario.turno,
<<<<<<< Updated upstream
        tipo: usuario.tipo || 'usuario'
=======
        tipo: usuario.tipo
>>>>>>> Stashed changes
      }
    });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export { registerController, loginController };