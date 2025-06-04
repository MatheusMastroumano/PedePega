const adminMiddleware = (req, res, next) => {
    if(!req.usuario || req.usuario.tipo !== 'admin') {
        return res.status(403).json({mensagem: "Acesso negado. Apenas administradores"});
    }
    next();
};

export default adminMiddleware;