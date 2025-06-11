import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

const authMiddleware = (req, res, next) => {
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
    
    // Adicionar o ID do usuário à requisição
    req.usuarioId = decoded.id;
    
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: "Token expirado" });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ erro: "Token inválido" });
    }

    return res.status(500).json({ erro: "Erro na autenticação" });
  }
};

export default authMiddleware;