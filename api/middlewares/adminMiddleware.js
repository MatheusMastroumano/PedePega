import { read } from "../config/database.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const usuario = await read("users", `id = ?`, [req.usuarioId]);

    if(!usuario) {
        return res.status(401).json({mensagem: "Usuário não encontrado"});
    }

    const adminEmails = ['admin@pedepega.com', 'admin@example.com', 'gustavoAdmin@pedepega.com', 'matheusAdmin@pedepega.com'];

    if (!adminEmails.includes(usuario.email)) {
        return res.status(403).json({mensagem: "Acesso negado. Apenas administradores"});
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    console.error('Erro no middleware de admin:', err);
    return res.status(403).json({mensagem: "Erro na verificação de permissões"});
  }
};

export default adminMiddleware;
