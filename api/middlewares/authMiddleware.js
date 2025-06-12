import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { read } from "../config/database.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o header existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    // Extrair o token (formato: "Bearer token")
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ erro: "Token malformado" });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe
    const usuario = await read("users", "id = ?", [decoded.id]);
    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    // Adicionar informações do usuário à requisição
    req.usuarioId = decoded.id;
    req.usuarioTipo = usuario.tipo || 'usuario';
    req.usuario = usuario;
    
    next();

  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        erro: "Token expirado",
        detalhes: "Faça login novamente para obter um novo token"
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        erro: "Token inválido",
        detalhes: "O token fornecido não é válido"
      });
    }

    return res.status(500).json({ 
      erro: "Erro na autenticação",
      detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export default authMiddleware;