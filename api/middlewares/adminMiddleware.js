import { read } from "../config/database.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const usuarioId = req.usuarioId;
    
    // Buscar usuário no banco
    const usuario = await read("users", "id = ?", [usuarioId]);
    
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    // Verificar se é admin
    if (usuario.tipo !== "admin") {
      return res.status(403).json({ mensagem: "Acesso negado. Apenas administradores podem realizar esta ação." });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    console.error("Erro ao verificar permissões de admin:", err);
    res.status(500).json({ mensagem: "Erro ao verificar permissões" });
  }
};

export default adminMiddleware;
