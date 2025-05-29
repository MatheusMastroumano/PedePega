import { JWT_SECRET } from "../config/jwt.js";

import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Buscar token no header Authorization
    const authHeader = req.headers.authorization;
    console.log('Auth Header recebido:', authHeader);
    
    if (!authHeader) {
      console.log('Header Authorization não encontrado');
      return res.status(401).json({ 
        mensagem: 'Token de acesso não fornecido',
        erro: 'UNAUTHORIZED' 
      });
    }

    // Verificar se o header tem o formato correto "Bearer token"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Formato do token inválido:', authHeader);
      return res.status(401).json({ 
        mensagem: 'Formato do token inválido',
        erro: 'INVALID_TOKEN_FORMAT' 
      });
    }

    const token = parts[1];
    console.log('Token extraído:', token ? 'Token presente' : 'Token ausente');

    if (!token) {
      return res.status(401).json({ 
        mensagem: 'Token não fornecido',
        erro: 'NO_TOKEN' 
      });
    }

    // Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no ambiente');
      return res.status(500).json({ 
        mensagem: 'Erro de configuração do servidor',
        erro: 'SERVER_CONFIG_ERROR' 
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', { userId: decoded.userId, exp: decoded.exp });
    
    // Verificar se o token não expirou
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('Token expirado');
      return res.status(401).json({ 
        mensagem: 'Token expirado',
        erro: 'TOKEN_EXPIRED' 
      });
    }

    // Adicionar dados do usuário na requisição
    req.usuarioId = decoded.userId;
    req.usuario = decoded;
    
    console.log('Autenticação bem-sucedida para usuário:', req.usuarioId);
    next();
    
  } catch (err) {
    console.error('Erro na verificação do token:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        mensagem: 'Token inválido',
        erro: 'INVALID_TOKEN' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        mensagem: 'Token expirado',
        erro: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor na autenticação',
      erro: 'INTERNAL_AUTH_ERROR' 
    });
  }
};

export default authMiddleware;