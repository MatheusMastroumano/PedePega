import jwt from 'jsonwebtoken';
import { secretKey } from './generateSecret.js';

const payload = {
    id: 2,
    tipo: 'comum'
};

// Gere o token utilizando o secretKey. O token expira em 3 hora.
const token = jwt.sign(payload, secretKey, { expiresIn: '3h' });

// Exiba o token com o prefixo "Bearer" para ser utilizado no header de autorização.
console.log("Authorization: Bearer " + token);