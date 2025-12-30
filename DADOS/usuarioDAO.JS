const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admwindows',
    database: 'tdsppi'
});

async function adicionar(nome_usuario, cpf, login, senha) {
    const sql = `
        INSERT INTO usuario (nome_usuario, cpf, login, senha)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [nome_usuario, cpf, login, senha]);
    return result.insertId;
}

async function verificarLogin(login, senha) {
    const sql = 'SELECT * FROM usuario WHERE login = ? AND senha = ?';
    const [rows] = await pool.execute(sql, [login, senha]);
    return rows.length > 0 ? rows[0] : null; // Retorna o usuário ou null
}

async function obterTodos() {
    const sql = 'SELECT id, nome_usuario, login, cpf FROM usuario';
    const [rows] = await pool.execute(sql);
    return rows;
}

module.exports = {
    adicionar,
    autenticar: verificarLogin,
    obterTodos
};