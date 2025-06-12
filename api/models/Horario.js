import { readAll, read, getConnection } from "../config/database.js";

// Função para inicializar a tabela de horários
const inicializarTabelaHorarios = async (connection) => {
  try {
    // Criar tabela se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS horarios (
        id_horario INT PRIMARY KEY AUTO_INCREMENT,
        horario TIME NOT NULL,
        turno ENUM('manha', 'tarde', 'noite') NOT NULL,
        disponivel BOOLEAN DEFAULT true,
        limiteAlunos INT DEFAULT 30,
        totalPedidos INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Verificar se já existem horários
    const [horarios] = await connection.query('SELECT COUNT(*) as total FROM horarios');
    
    if (horarios[0].total === 0) {
      // Inserir horários da manhã
      await connection.query(`
        INSERT INTO horarios (horario, turno) VALUES
        ('07:00:00', 'manha'),
        ('07:30:00', 'manha'),
        ('08:00:00', 'manha'),
        ('08:30:00', 'manha'),
        ('09:00:00', 'manha'),
        ('09:30:00', 'manha'),
        ('10:00:00', 'manha'),
        ('10:30:00', 'manha'),
        ('11:00:00', 'manha'),
        ('11:30:00', 'manha'),
        ('12:00:00', 'manha'),
        ('12:30:00', 'manha')
      `);

      // Inserir horários da tarde
      await connection.query(`
        INSERT INTO horarios (horario, turno) VALUES
        ('13:00:00', 'tarde'),
        ('13:30:00', 'tarde'),
        ('14:00:00', 'tarde'),
        ('14:30:00', 'tarde'),
        ('15:00:00', 'tarde'),
        ('15:30:00', 'tarde'),
        ('16:00:00', 'tarde'),
        ('16:30:00', 'tarde'),
        ('17:00:00', 'tarde'),
        ('17:30:00', 'tarde'),
        ('18:00:00', 'tarde'),
        ('18:30:00', 'tarde')
      `);

      // Inserir horários da noite
      await connection.query(`
        INSERT INTO horarios (horario, turno) VALUES
        ('19:00:00', 'noite'),
        ('19:30:00', 'noite'),
        ('20:00:00', 'noite'),
        ('20:30:00', 'noite'),
        ('21:00:00', 'noite'),
        ('21:30:00', 'noite'),
        ('22:00:00', 'noite'),
        ('22:30:00', 'noite'),
        ('23:00:00', 'noite'),
        ('23:30:00', 'noite'),
        ('00:00:00', 'noite'),
        ('00:30:00', 'noite')
      `);

      console.log('Horários inseridos com sucesso!');
    }
  } catch (err) {
    console.error('Erro ao inicializar tabela de horários:', err);
    throw err;
  }
};

// Função para obter horários por turno
export const obterHorariosPorTurno = async (turno) => {
  return [];
};

// Função para verificar disponibilidade de um horário
export const verificarDisponibilidadeHorario = async (horario) => {
  return {
    disponivel: false,
    totalPedidos: 0,
    limiteAlunos: 0,
    motivo: "Horários temporariamente indisponíveis"
  };
};

// Função para obter todos os horários disponíveis
export const obterTodosHorarios = async () => {
  return [];
}; 