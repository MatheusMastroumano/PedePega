import jwt from 'jsonwebtoken';
import {read, compare} from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';

const loginController = async (req, res) => {
    const {email, senha} = req.body;

    try {
        const usuario = await read('email', `email = '${email}'`);

        if(!usuario) {
            return res.status(404).json({mensagem: 'Usuário não encontrado'});
        }
        const senhaCorreta = await compare(senha, usuario.senha);

        if(!senhaCorreta) {
            return res.status(401).json({mensagem: 'Senha incorreta'});
        }

        const token = jwt.sign({id: usuario.id, tipo: usuario.tipo}, JWT_SECRET , {
            expiresIn: '3h',
        });

        res.json({mensagem: 'Login realizado com sucesso', token});
    } catch (err) {
        console.error('Erro ao fazer login')
        res.status(500).json({mensagem: 'Erro ao fazer login'});
    }
};

export { loginController };