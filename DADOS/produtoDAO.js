const mysql = require('mysql2/promise');

//Conexão com o banco
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // altere conforme seu MySQL
    password: 'admwindows',      // altere conforme seu MySQL
    database: 'tdsppi'
});

//Create: Adicionar novo produto
async function adicionar(nome, descricao, preco) {
    const sql = 'INSERT INTO produto (nome, descricao, preco) VALUES  (?, ?, ?) ';
    const result = await pool.execute(sql, [nome, descricao, preco]);
    return result.insertId; 
}

//Create: Obter produtos
async function obterTodos() {
    const sql = 'SELECT * FROM produto';
    const [rows] = await pool.execute(sql);
    return rows;
}

//Obter por id
async function obterPorId(id) {
    const sql = 'SELECT * FROM produto WHERE id = ?'
    const [rows] = await pool.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
    
}

//UPDATE: Atualizar
async function atualizar(id, nome, descricao, preco) {
    const sql = `
    UPDATE produto    SET nome = ?,  descricao = ?, preco = ?
        WHERE id = ?
    `;

    console.log('DAO Atualizar: ID, NOME, PRECO, DESC:', id, nome, preco, descricao);

    const [result] = await pool.execute(sql, [nome, descricao, preco, id]);
    console.log('Resultado da atualização (affectedRows):', result.affectedRows);
    return result.affectedRows;
}

//DELETE: remover produto / WHERE id filtra o id para o delete preciso
async function remover(id) {
    const sql = 'DELETE FROM produto WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
}

module.exports = {
    adicionar,
    obterTodos,
    obterPorId,
    atualizar,
    remover
};