// carrinhoDAO.js
const mysql = require('mysql2/promise');

/*
CREATE DATABASE IF NOT EXISTS tdsppi;

USE tdsppi;

CREATE TABLE IF NOT EXISTS carrinho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto VARCHAR(255) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);

*/

// Criar conexão com o banco
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // altere conforme seu MySQL
  password: 'admwindows',      // altere conforme seu MySQL
  database: 'tdsppi'
});

 // Adicionar item ao carrinho
async function adicionar(id_produto, quantidade) {
  const sql = 'INSERT INTO carrinho (id_produto, quantidade) VALUES (?, ?)';
  const [result] = await pool.execute(sql, [id_produto, quantidade]);
  return result.insertId;
}

// Limpar carrinho (remover todos os itens)
async function limpar() {
  const sql = 'DELETE FROM carrinho';
  await pool.execute(sql);
}

// Obter todos os itens do carrinho
async function obterTodos() {
  const sql = 'SELECT * FROM carrinho';
  const [rows] = await pool.execute(sql);
  return rows;
}

// Verificar se o carrinho está vazio
async function estaVazio() {
  const sql = 'SELECT COUNT(*) as total FROM carrinho';
  const [rows] = await pool.execute(sql);
  return rows[0].total === 0;
}

async function listarItensComDetalhes() {
    const sql = `
        SELECT 
            c.id AS id_carrinho,
            c.quantidade,
            p.id AS id_produto,
            p.nome AS nome_produto,
            p.preco AS preco_unitario
        FROM carrinho c
        JOIN produto p ON c.id_produto = p.id
    `;
    const [rows] = await pool.execute(sql);
    // Adicione o cálculo do subtotal (preço * quantidade)
    return rows.map(item => ({
        ...item,
        subtotal: item.quantidade * item.preco_unitario
    }));
}
module.exports = {
  adicionar,
  limpar,
  obterTodos,
  estaVazio,
  listarItensComDetalhes
};
