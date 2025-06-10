import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { read } from "../config/database.js";

const authMiddleware = (rolesPermitidos = []) => {
  return async (req, res, next) => {
    try {
      // Verificação básica do token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ erro: "Token malformado" });
      }

      // Decodificar o token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário no banco para verificar o tipo
      const usuario = await read("users", `id = ?`, [decoded.id]);
      if (!usuario) {
        return res.status(401).json({ erro: "Usuário não encontrado" });
      }

      // Verificar se o tipo do usuário está nos roles permitidos
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.tipo)) {
        return res.status(403).json({ erro: "Acesso negado. Permissões insuficientes" });
      }

      // Adicionar informações do usuário à requisição
      req.usuarioId = decoded.id;
      req.usuario = usuario;
      
      next();

    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ erro: "Token expirado" });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ erro: "Token inválido" });
      }

      console.error('Erro no authMiddleware:', err);
      return res.status(500).json({ erro: "Erro na autenticação" });
    }
  };
};

export default authMiddleware;