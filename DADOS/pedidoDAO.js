const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admwindows',
    database: 'tdsppi'
});

async function adicionar(nomeProduto, quantidade, valor_total) {
    const sql = `
        INSERT INTO pedido (nomeProduto, quantidade, valor_total, data_pedido, status)
        VALUES (?, ?, ?, NOW(), 'Pendente')
    `;
    const [result] = await pool.execute(sql, [nomeProduto, quantidade, valor_total]);
    return result.insertId;
}

async function obterTodos() {
    const sql = `
        SELECT id, 
               CONCAT(nomeProduto, ' (Qtd: ', quantidade, ')') AS descricao, 
               valor_total, 
               data_pedido AS data_criacao 
        FROM pedido 
        ORDER BY data_pedido DESC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
}

async function obterPorId(id) {
    const sql = 'SELECT * FROM pedido WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function atualizar(id, nomeProduto, quantidade, valor_total) {
    const sql = `
        UPDATE pedido 
        SET nomeProduto = ?, quantidade = ?, valor_total = ?
        WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [nomeProduto, quantidade, valor_total, id]);
    return result.affectedRows;
}

async function remover(id) {
    // Atenção: Em um sistema real, remover um pedido requer lógica extra para não quebrar a integridade.
    const sql = 'DELETE FROM pedido WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
}

async function relatorioVendas(data_inicio, data_fim) {
    const sql = `
        SELECT * FROM pedido
        WHERE data_criacao BETWEEN ? AND ?
        ORDER BY data_criacao DESC
    `;
    const [rows] = await pool.execute(sql, [data_inicio, data_fim]);
    return rows;
}

//Obter resumos de vendas
async function obterResumoVendas(dataInicio, dataFim) {
    // Estas são as funções de agregação que você mencionou (COUNT, SUM, AVG)
    const sql = `
        SELECT 
            COUNT(id) AS total_pedidos,
            SUM(valor_total) AS valor_total,
            AVG(valor_total) AS media_vendas,
            MIN(valor_total) AS menor_venda,
            MAX(valor_total) AS maior_venda
        FROM pedido
        WHERE data_criacao >= ? AND data_criacao <= ?
    `;

    const [rows] = await pool.execute(sql, [dataInicio, dataFim]);
    
    // Retorna a linha de resumo, que contém todas as estatísticas
    return rows[0]; 
}

async function obterPorPeriodo(dataInicio, dataFim) {
    const sql = `
        SELECT id, descricao, valor_total, data_criacao 
        FROM pedido 
        WHERE data_criacao >= ? AND data_criacao <= ? 
        ORDER BY data_criacao DESC
    `;
    const [rows] = await pool.execute(sql, [dataInicio, dataFim]);
    return rows;
}

module.exports = {
    adicionar,
    obterTodos,
    obterPorId,
    atualizar,
    remover,
    relatorioVendas,
    obterResumoVendas,
    obterPorPeriodo
};