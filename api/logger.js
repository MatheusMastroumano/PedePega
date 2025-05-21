// logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Obter o diretório atual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Criar pasta de logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Função para formatar a data
const formatDate = () => {
  const data = new Date();
  return data.toISOString();
};

// Função para salvar log em arquivo
const saveToFile = (message) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(logsDir, `app-${today}.log`);
  
  fs.appendFile(logFile, message + '\n', (err) => {
    if (err) console.error('Erro ao salvar log:', err);
  });
};

// Middleware de log
const logger = (req, res, next) => {
  const timestamp = formatDate();
  const method = req.method;
  const url = req.url;
  
  // Colorir método com base no tipo de requisição
  let coloredMethod;
  switch (method) {
    case 'GET':
      coloredMethod = chalk.blue(method);
      break;
    case 'POST':
      coloredMethod = chalk.green(method);
      break;
    case 'PUT':
      coloredMethod = chalk.yellow(method);
      break;
    case 'DELETE':
      coloredMethod = chalk.red(method);
      break;
    default:
      coloredMethod = chalk.white(method);
  }
  
  // Log no console com cores usando chalk
  console.log(`${chalk.gray('[')}${chalk.cyan(timestamp)}${chalk.gray(']')} ${coloredMethod} ${chalk.white(url)}`);
  
  // Salvar em arquivo (sem cores)
  saveToFile(`[${timestamp}] ${method} ${url}`);
  
  // Adicionar tempo de resposta
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Colorir status baseado no código
    let coloredStatus;
    if (status >= 500) {
      coloredStatus = chalk.bgRed.white(` ${status} `);
    } else if (status >= 400) {
      coloredStatus = chalk.bgYellow.black(` ${status} `);
    } else if (status >= 300) {
      coloredStatus = chalk.bgCyan.black(` ${status} `);
    } else {
      coloredStatus = chalk.bgGreen.black(` ${status} `);
    }
    
    // Log completo com tempo de resposta e status
    console.log(
      `${chalk.gray('[')}${chalk.cyan(formatDate())}${chalk.gray(']')} ` +
      `${coloredMethod} ${chalk.white(url)} ${coloredStatus} ` +
      `${chalk.magenta(`${duration}ms`)}`
    );
    
    // Salvar em arquivo (sem cores)
    saveToFile(`[${formatDate()}] ${method} ${url} ${status} - ${duration}ms`);
  });

  next();
};

export default logger;