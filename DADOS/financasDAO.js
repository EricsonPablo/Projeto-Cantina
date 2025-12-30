// DADOS/financasDAO.js
const mysql = require('mysql2/promise');

// Configuração do pool de conexão - Mantenha a mesma que a do carrinhoDAO
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admwindows', // Corrija!
    database: 'tdsppi'
});

//CRUD tabela financas_entrada
async function adicionarEntrada(id_financas, valor_recebido, responsavel_pagamento) {
    const sql = `
        INSERT INTO financas_entrada
        (id_financas, valor_recebido, responsavel_pagamento, data_criacao, data_modificacao)
        VALUES (?, ?, ?, NOW(), NOW())
    `
    const [result] = await pool.execute(sql, [id_financas, valor_recebido, responsavel_pagamento]);
    return result.insertId;
}

// CREATE: Adicionar novo cliente
async function adicionarCliente(nome, curso, cpf, nome_responsavel, valor_atual) {
    const sql = `INSERT INTO financas_cliente (nome, curso, cpf, nome_responsavel, valor_atual) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [nome, curso, cpf, nome_responsavel, valor_atual]);
    const clienteId = result.insertId;
    
    // Se o valor_atual for maior que 0, insere uma entrada inicial (saldo inicial)
    if (valor_atual > 0) {
        await adicionarEntrada(clienteId, valor_atual, nome_responsavel);
    }
    
    return clienteId;
}

// READ: Obter todos os clientes
async function obterClientes() {
    const sql = 'SELECT id, nome, curso, cpf, nome_responsavel, valor_atual FROM financas_cliente';
    const [rows] = await pool.execute(sql);
    return rows;
}

// READ: Obter cliente por ID
async function obterPorId(id) {
    // Usa SELECT com colunas explícitas para garantir nomes consistentes
    const sql = 'SELECT id, nome, curso, cpf, nome_responsavel, valor_atual FROM financas_cliente WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    // Retorna o objeto ou null — mantém a estrutura esperada pelo resto do código
    const row = rows.length > 0 ? rows[0] : null;
    
    return row;
}

// UPDATE: Atualizar dados do cliente
async function atualizarCliente(id, nome, curso, cpf, nome_responsavel, valor_atual) {
    const sql = `
        UPDATE financas_cliente 
        SET nome = ? , curso = ?, cpf = ?, nome_responsavel = ?, valor_atual = ?
        WHERE id = ?
    `;

    // Garante que a ordem dos parâmetros está correta e usa nome_responsavel
    const [result] = await pool.execute(sql, [nome, curso, cpf, nome_responsavel, valor_atual, id]);
    return result.affectedRows;
}

// DELETE: Remover cliente
async function removerCliente(id) {
    const sql = 'DELETE FROM financas_cliente WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
}

async function atualizarSaldo(id_financas, valor, operacao) {
    let sql;
    if (operacao === '+') {
        sql = 'UPDATE financas_cliente SET valor_atual = valor_atual + ? WHERE id = ?';
    } else if (operacao === '-') {
        sql = 'UPDATE financas_cliente SET valor_atual = valor_atual - ? WHERE id = ?';
    } else {
        throw new Error('Operação de saldo inválida. Use "+" ou "-".');
    }

    const [result] = await pool.execute(sql, [valor, id_financas]);
    return result.affectedRows;
}

async function adicionarSaida(id_financas, valor_saida) {
    const sql = `
        INSERT INTO financas_saidas
       (id_financas, valor_saida, data_criacao, data_modificacao) 
        VALUES (?, ?, NOW(), NOW())
    `;
    const [result] = await pool.execute(sql, [id_financas, valor_saida]);
    await atualizarSaldo(id_financas, valor_saida, '-');
    return result.insertId;
}

async function obterEntradas() {
    const sql = 'SELECT * FROM financas_entrada';
    const [rows] = await pool.execute(sql);
    return rows;
}

async function obterSaidas() {
    const sql = 'SELECT * FROM financas_saidas';
    const [rows] = await pool.execute(sql);
    return rows;
}

async function obterEntradasPorId(id) {
    const sql = 'SELECT * FROM financas_entrada WHERE id = ?'; 
    const [rows] = await pool.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null; // Retorna o objeto ou null
}

async function obterSaidasPorId(id) {
    const sql = 'SELECT * FROM financas_saidas WHERE id = ?'; 
    const [rows] = await pool.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function atualizarEntrada(id, id_financas, valor_recebido, responsavel_pagamento) {
    const entradaAntiga = await obterEntradasPorId(id);
    const valorAntigo = entradaAntiga ? entradaAntiga.valor_recebido : 0;

    // 2. Atualizar a transação no banco
    const sql = `
        UPDATE financas_entrada
        SET id_financas = ?, valor_recebido = ?, responsavel_pagamento = ?
        WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [id_financas, valor_recebido, responsavel_pagamento, id]);
 
    // 3. Corrigir o saldo do cliente: Subtrai o valor antigo e soma o novo valor
    if (result.affectedRows > 0) {
        // PASSO 3a: Garante que a remoção do valor antigo seja AGUARDADA (await)
        if (valorAntigo > 0) {
            await atualizarSaldo(id_financas, valorAntigo, '-'); 
        }
        // PASSO 3b: Só então o novo valor é adicionado
        await atualizarSaldo(id_financas, valor_recebido, '+');
    }

    return result.affectedRows;
}
async function atualizarSaida(id, id_financas, valor_saida) {
    const saidaAntiga = await obterSaidasPorId(id);
    const valorAntigo = saidaAntiga ? saidaAntiga.valor_saida : 0;

    // 2. Atualizar a transação no banco
    const sql = `
        UPDATE financas_saidas
        SET id_financas = ?, valor_saida = ? 
        WHERE id = ?
    `; 
    const [result] = await pool.execute(sql, [id_financas, valor_saida, id]);
 
    // 3. Corrigir o saldo do cliente: Adiciona o valor antigo e subtrai o novo valor
    if (result.affectedRows > 0) {
        // PASSO 3a: Garante que a devolução do valor antigo seja AGUARDADA (await)
        if (valorAntigo > 0) {
            await atualizarSaldo(id_financas, valorAntigo, '+'); 
        }
        // PASSO 3b: Só então a nova saída é subtraída
        await atualizarSaldo(id_financas, valor_saida, '-');
    }

    return result.affectedRows;
}

async function removerEntrada(id) {
    const entrada = await obterEntradasPorId(id);

    if (!entrada) return 0;

    const sql = 'DELETE FROM financas_entrada WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows > 0) {
        await atualizarSaldo(entrada.id_financas, entrada.valor_recebido, '-');
    }

    return result.affectedRows;
}

async function removerSaida(id) {
    const saida = await obterSaidasPorId(id);

    if (!saida) return 0;

    const sql = 'DELETE FROM financas_saidas WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows > 0) {
        await atualizarSaldo(saida.id_financas, saida.valor_saida, '+')
    }

    return result.affectedRows;
}

async function obterEntradasPorCliente(id_financas) {
    const sql = 'SELECT * FROM financas_entrada WHERE id_financas = ?';
    const [rows] = await pool.execute(sql, [id_financas]);
    return rows;
}

async function obterSaidasPorCliente(id_financas) {
    const sql = 'SELECT * FROM financas_saidas WHERE id_financas = ?'; // BUSCA PELA FK
    const [rows] = await pool.execute(sql, [id_financas]);
    return rows;
}


module.exports = {
    adicionarCliente,
    obterClientes,
    obterPorId,
    atualizarCliente,
    removerCliente,
    adicionarEntrada,
    adicionarSaida,
    obterEntradas,
    obterSaidas,
    obterEntradasPorId,
    obterSaidasPorId,
    atualizarEntrada,
    atualizarSaida,
    removerEntrada,
    removerSaida,
    atualizarSaldo,
    obterEntradasPorCliente,
    obterSaidasPorCliente
};