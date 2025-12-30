const fs = require('fs');
const path = require('path');
const carrinho = require('../DADOS/carrinhoDAO');
const produtoDAO = require('../DADOS/produtoDAO');
const financas = require('../DADOS/financasDAO');
const pedidoDAO = require('../DADOS/pedidoDAO');
const usuario = require('../DADOS/usuarioDAO');

function render(templateName, dados = {}) {
    const filePath = path.join(__dirname, `${templateName}.html`);
    let html = fs.readFileSync(filePath, 'utf-8'); //SUBSTITUI O 'placeholder' no seu HTML

    for (const chave in dados){
        const marcador = new RegExp(`{{${chave}}}`, 'g');
        const valor = (dados[chave] === undefined || dados[chave] === null) ? '' : dados[chave];
        html = html.replaceAll(marcador, valor);
    }
    return html;
}

async function getListaClientesHtml() {
    const clientes = await financas.obterClientes();
    return clientes.map(c => 
        `<tr>
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.curso}</td>
            <td>${c.cpf}</td>
            <td>${c.nome_responsavel}</td>
            <td>R$ ${parseFloat(c.valor_atual).toFixed(2)}</td>
            <td>
                <a href="/financas/editar?id=${c.id}" class = "btn-editar">Editar</a> | 
                <a href="/financas/remover?id=${c.id}" class = "btn-remover">Remover</a>
            </td>
            <td>
                <a href="/financas/transacoes?id=${c.id}" class = "btn-transações">Ver Transações</a>
            </td>
        </tr>`
    ).join('');
}

//Crud de Produto
async function renderFormulario(mensagem = '') {
    const produtos = await produtoDAO.obterTodos();
    const listaProdutosGerenciamento = produtos.map((item, i) =>
        `<tr>
            <td>${item.id}</td> 
            <td>${item.nome}</td> 
            <td>R$ ${parseFloat(item.preco).toFixed(2)}</td> 
            <td>
                <a href="/produto/editar?id=${item.id}" class = "btn-editar">Editar</a> | 
                <a href="/produto/remover?id=${item.id}" class = "btn-remover">Remover</a>
                | <a href="/carrinho/adicionar?id_produto=${item.id}&quantidade=1" class="btn-comprar">Comprar</a>
            </td>
            <td>${item.descricao}</td>
        </tr>`
    ).join('')
    /*obtem a lista completa de carrinhos*/ 
    const itensCarrinho = await carrinho.listarItensComDetalhes(); 

    const listaCarrinho = itensCarrinho.map((item, i) =>
        `<tr>
            <td>${item.quantidade}x</td>
            <td>${item.nome_produto}</td>
            <td>R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
            <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
            </tr>`
    ).join('') || '<tr><td colspan="4">Carrinho Vazio.</td></tr>';

    const totalCarrinho = itensCarrinho.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);

        return render('index', {
                mensagem: mensagem ? `<p style="color:red;">${mensagem}</p>` : '',
                actionForm: '/salvar',
                listaProdutos: listaProdutosGerenciamento || '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>',
                listaCarrinho: listaCarrinho,
                totalCarrinho: totalCarrinho,
                tituloForm: 'Adicionar Novo Produto',
                itemId: '',
                itemNome: '',
                itemDescricao: '',
                itemPreco: '',
                botaoVoltar: ''
        });
}

//Função de visualizar carrinho antes de finalizar
async function renderFinalizar() {
    const produtos = await carrinho.obterTodos();
    const lista = produtos.map((item, i) =>
    `<li>${i + 1} - ID Produto: ${item.id_produto}, Quantidade: ${item.quantidade}</li>`
    ).join('');

    return render('finalizar', { listaProdutos: lista });
}

async function renderEditarProduto(id, mensagem = '') {
    const produto = await produtoDAO.obterPorId(id);
    const produtos = await produtoDAO.obterTodos();

    const lista = produtos.map((item, i) =>
        `<tr>
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.preco}</td>
            <td>
                <a href="/produto/editar?id=${item.id}" class = "btn-editar">Editar</a> |
                <a href="/produto/remover?id=${item.id}" class = "btn-remover">Remover</a>
            </td>
            <td>${item.descricao}</td>
        </tr>`
    ).join('')

    if (!produto) {
        return renderFormulario(`Produto com o id ${id} não encontrado.`, mensagem)
    };

   // Valores pré-preenchidos para o produto (Editar)
    return render('index', {
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : 'Editar Produto',
        tituloForm: `Editar Produto: ${produto.nome}`,
        actionForm: '/produto/atualizar',
        itemId: produto.id,
        itemNome: produto.nome,
        itemDescricao: produto.descricao,
        itemPreco: parseFloat(produto.preco).toFixed(2),
        botaoVoltar: '<a href="/" class = "btn-editar">Cancelar Edição</a>',
        // 3. Usa a lista recém-gerada:
        listaProdutos: lista 
    });

}

//Crud de cliente / Financas
async function renderFinancas(mensagem = '') {
    const clientes = await financas.obterClientes(); 
    
    const lista = clientes.map(c => 
        `<tr>
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.curso}</td>
            <td>${c.cpf}</td>
            <td>${c.nome_responsavel}</td>
            <td>R$ ${parseFloat(c.valor_atual).toFixed(2)}</td>
            <td>
                <a href="/financas/editar?id=${c.id}" class = "btn-editar">Editar</a> | 
                <a href="/financas/remover?id=${c.id}" class = "btn-remover">Remover</a>
            </td>
            <td>
                <a href="/financas/transacoes?id=${c.id}" class = "btn-transações">Ver Transações</a>
            </td>
        </tr>`
    ).join('');
    
    // Valores padrão para o formulário (Adicionar)
    return render('financas', {
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : '',
        tituloForm: 'Adicionar Novo Cliente',
        actionForm: '/financas/adicionar',
        // Campos vazios para o modo Adicionar
        clienteId: '', 
        clienteNome: '', 
        clienteCurso: '', 
        clienteCpf: '', 
        clienteResponsavel: '', 
        clienteValor: '0.00',
        botaoVoltar: '',
        listaClientes: lista,
        
    });
    
}

async function renderEditarFinancas(id, mensagem = '') {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
        return renderFinancas(`ID inválido: ${id}`, mensagem);
    }
    const cliente = await financas.obterPorId(idNum);
    const clientes = await financas.obterClientes();

    

    const lista = clientes.map((item, i) => 
    // ... (o mesmo template HTML de <tr> que você usou em renderFinancas)
         `<tr>
             <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.curso}</td>
            <td>${item.cpf}</td> 
            <td>${item.nome_responsavel}</td>
            <td>R$ ${parseFloat(item.valor_atual).toFixed(2)}</td>
            <td>
                <a href="/financas/editar?id=${item.id}" class = "btn-editar" >Editar</a> | 
                <a href="/financas/remover?id=${item.id}" class= "btn-remover">Remover</a>
            </td>
            <td>
                <a href="/financas/transacoes?id=${item.id}" class="btn-transações">Ver Transações</a>
            </td>
        </tr>`
    ).join('');

    if (!cliente) {
        return renderFinancas(`Cliente com ID ${idNum} não encontrado.`, mensagem);
    }

    // Valores pré-preenchidos para o formulário (Editar)
    return render('financas', {
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : 'Editando Cliente',
        tituloForm: `Editar Cliente: ${cliente.nome}`,
        actionForm: '/financas/atualizar',
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteCurso: cliente.curso,
        clienteCpf: cliente.cpf,
        clienteResponsavel: cliente.nome_responsavel,
        clienteValor: parseFloat(cliente.valor_atual).toFixed(2),
        // botaoVoltar: '<a href="/financas" class="btn-editar">Cancelar Edição</a>',
        formularioTransacao: '<a href="/financas" class="btn-transações">Cancelar Edição</a>',
        listaClientes: lista,
    });
}

async function renderDetalhesFinancas(id, mensagem = '') {
    const cliente = await financas.obterPorId(id);
    if (!cliente) {
        return renderFinancas(`Cliente com ID ${id} não encontrado.`, mensagem);
    }

    const entradas = await financas.obterEntradasPorCliente(id);
    const saidas = await financas.obterSaidasPorCliente(id);

    const listaEntradas = entradas.map(e => 
        `<tr>
            <td>${e.id}</td>
            <td>${e.id_financas}</td>
            <td>R$ ${parseFloat(e.valor_recebido).toFixed(2)}</td>
            <td>${e.responsavel_pagamento}</td>
            <td>${e.data_criacao ? new Date(e.data_criacao).toLocaleString() : ''}</td>
            <td>${e.data_modificacao ? new Date(e.data_modificacao).toLocaleString() : ''}</td>
            <td>
                <a href="/financas/entrada/editar?id=${e.id}">Editar</a>
                <a href="/financas/entrada/remover?id=${e.id}&clienteId=${id}">Remover</a>
            </td>
        </tr>`
    ).join('') || '<tr><td colspan="7">Nenhuma entrada registrada.</td></tr>';

    const listaSaidas = saidas.map(s => 
        `<tr>
            <td>${s.id}</td>
            <td>${s.id_financas}</td>
            <td>R$ ${parseFloat(s.valor_saida).toFixed(2)}</td>
            <td>${s.data_criacao ? new Date(s.data_criacao).toLocaleString() : ''}</td>
        </tr>`
    ).join('') || '<tr><td colspan="4">Nenhuma saída registrada.</td></tr>';

    return render('financas', {
        mensagem: mensagem ? `<p style="color:green; font-weight: bold;">${mensagem}</p>` : `Transações de ${cliente.nome}`,
        tituloForm: '',
        actionForm: '',

        clienteId: '', 
        clienteNome: '', 
        clienteCurso: '',
        clienteCpf: '', 
        clienteResponsavel: '', 
        clienteValor: '',

        botaoVoltar: '<a href="/financas" class = "btn-editar">Voltar à Lista de Clientes</a>',

        formularioTransacao: `
            <h2>Detalhes de Transações</h2>
            <p><strong>Cliente:</strong> ${cliente.nome} | <strong>CPF:</strong> ${cliente.cpf} | <strong>Saldo Atual:</strong> R$ ${parseFloat(cliente.valor_atual).toFixed(2)}</p>
            
            <section style="margin-top: 20px;">
                <h4>Registrar Saída (Débito)</h4>
                <form action="/financas/saida/salvar" method="POST" style="display: flex; gap: 10px;">
                <input type="hidden" name="id_financas" value="${cliente.id}">
                    <input type="number" step="0.01" name="valor_saida" placeholder="Valor da Saída" required>
                    <button type="submit">Registrar Saída</button>
                </form>
            </section>

            <hr>
            <h4>Entradas (Recebimentos)</h4>
            <table>
                <thead><tr><td>ID</td><td>ID Cliente</td><td>Valor Entrada</td><td>Responsável</td><td>Data Criação</td><td>Data Modificação</td><td>Ações</td></tr></thead>
                <tbody>${listaEntradas}</tbody>
            </table>

            <h4>Saídas (Débitos)</h4>
            <table>
                <thead><tr><td>ID</td><td>ID Cliente</td><td>Valor Saída</td><td>Data Criação</td></tr></thead>
                <tbody>${listaSaidas}</tbody>
            </table>
        `,
        listaClientes: '',
    });
}

async function renderLogin(mensagem = '') {
    return render('login', { 
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : ''
    });
}

async function renderUsuarios(mensagem = '') {
    const usuarios = await usuario.obterTodos();
    
    const lista = usuarios.map(cliente => 
        `<tr>
            <td>${cliente.id}</td>
            <td>${cliente.nome_usuario}</td>
            <td>${cliente.login}</td>
            <td>${cliente.cpf}</td>
            <td>
                </td>
        </tr>`
    ).join('');

    return render('usuarios', { 
        mensagem: mensagem ? `<p style="color:green; font-weight: bold;">${mensagem}</p>` : 'Cadastro de Usuários',
        listaUsuarios: lista
    });
}

async function renderEditarEntrada(id, mensagem = '') {
    const entrada = await financas.obterEntradasPorId(id);

    if (!entrada){
        return renderFinancas(`Entrada com ID ${id} não encontrada.`, mensagem);
    }
    const cliente = await financas.obterPorId(entrada.id_financas);
    const clientes = await financas.obterClientes();
    const listaClientes = clientes.map(c => 
        `<tr>
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.curso}</td>
            <td>${c.cpf}</td>
            <td>${c.nome_responsavel}
            <td>R$ ${parseFloat(c.valor_atual).toFixed(2)}</td>
            <td>
                <a href="/financas/editar?id=${c.id}" class = "btn-editar">Editar</a> | 
                <a href="/financas/remover?id=${c.id}" class = "btn-remover">Remover</a>
            </td>
            <td>
                <a href="/financas/transacoes?id=${c.id}" class = "btn-transações">Ver Transações</a>
            </td>
        </tr>`
    ).join('');

    // Valores pré-preenchidos para o formulário (Editar)
    return render('financas', {
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : 'Editar Cliente', // Adicionei a mensagem aqui
        tituloForm: `Editar Entrada: ${cliente.nome}`,
        actionForm: '/financas/entrada/atualizar',
        itemId: entrada.id,
        clienteId: cliente.id,
        itemValor: parseFloat(entrada.valor_recebido).toFixed(2),
        itemResponsavel: entrada.responsavel_pagamento,
        clienteNome: '', 
        clienteCurso: '', 
        clienteCpf: '', 
        clienteResponsavel: '', 
        clienteValor: '',
        botaoVoltar: '<a href="/financas/transacoes?id=' + cliente.id + '">Cancelar Edição e Voltar</a>',
        listaClientes: listaClientes
    });
}

async function renderEditarSaida(id, mensagem = '') {
    const saida = await financas.obterSaidasPorId(id);

    if (!saida) {
        return renderFinancas(`Saída com ID ${id} não encontrada.`, mensagem);
    }
    
    const cliente = await financas.obterPorId(saida.id_financas);

    const clientes = await financas.obterClientes();
    const listaClientes = clientes.map(c => 
        `<tr>
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.curso}</td>
            <td>${c.cpf}</td>
            <td>${c.nome_responsavel}
            <td>R$ ${parseFloat(c.valor_atual).toFixed(2)}</td>
            <td>
                <a href="/financas/editar?id=${c.id}" class = "btn-editar">Editar</a> | 
                <a href="/financas/remover?id=${c.id}" class = "btn-remover">Remover</a>
            </td>
            <td>
                <a href="/financas/transacoes?id=${c.id}" class = "btn-transações">Ver Transações</a>
            </td>
        </tr>`
    ).join('');
    return render('financas', {
        mensagem: mensagem ? `<p style="color:blue; font-weight: bold;">${mensagem}</p>` : `Editando Saída ID: ${saida.id} - Cliente: ${cliente.nome}`,
        tituloForm: `Editar Saída`, // Título do formulário (aparece no H3)
        actionForm: '/financas/saida/atualizar', // Rota POST que espera 'itemId', 'clienteId', 'itemValor'

        // DADOS ENVIADOS:
        clienteId: cliente.id, // ID do Cliente (correto, mas não é a ID da Saída)
        itemId: saida.id, // ID da Saída
        itemValor: parseFloat(saida.valor_saida).toFixed(2), // Valor da Saída

        // Campos vazios ou padrão para forçar o formulário principal a ser ignorado
        clienteNome: '', 
        clienteCurso: '', 
        clienteCpf: '', 
        clienteResponsavel: '', 
        clienteValor: '', 
        listaClientes: listaClientes,
    });
}

async function renderPedidos() {
    try {
        // 1. Garante que os dados sejam buscados
        const pedidos = await pedidoDAO.obterTodos(); 

        let linhasTabela = '';
        if (pedidos.length > 0) {
            linhasTabela = pedidos.map(pedido => `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.descricao}</td>
                    <td>R$ ${pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2) : '0.00'}</td>
                    <td>${pedido.data_criacao ? new Date(pedido.data_criacao).toLocaleDateString() : 'N/A'}</td> 
                    <td>
                        <a href="/pedido/editar?id=${pedido.id}">Editar</a> |
                        <a href="/pedido/remover?id=${pedido.id}" onclick="return confirm('Remover Pedido ID ${pedido.id}?');">Remover</a>
                    </td>
                </tr>
            `).join('');
        } else {
            linhasTabela = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
        }

        return render('pedidos', { 
            mensagem: '', 
            linhasTabela: linhasTabela 
        });

    } catch (error) {
        console.error('ERRO EM renderPedidos:', error);
        // Retorna um erro amigável (ou o 404, se a view pedidos.html não for encontrada)
        return renderErro404('/pedidos - Erro interno: ' + error.message); 
    }
}

async function renderErro404(pathname) {
     return `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>404 - Não Encontrado</title>
        </head>
        <body>
            <h1>404 - Página Não Encontrada</h1>
            <p>O caminho <b>${pathname}</b> não corresponde a nenhuma rota.</p>
            <p><a href="/">Voltar para a página inicial</a></p>
        </body>
        </html>
    `;
}

async function renderEditarPedido(pedido, mensagem = '') {
    
    if (!pedido) {
        return renderPedidos(`Pedido não encontrado.`, mensagem);
    }

    const listaPedidosCompleta = await pedidoDAO.listarTodos();
    const lista = listaPedidosCompleta.map(p => 
        `<tr>
            <td>${p.id}</td>
            <td>R$ ${parseFloat(p.valor_total_venda).toFixed(2)}</td>
            <td>${p.descricao}</td>
            <td>${p.data_criacao ? p.data_criacao.toLocaleDateString() : 'N/A'}</td>
            <td>${p.data_modificacao ? p.data_modificacao.toLocaleDateString() : 'N/A'}</td>
            <td>
                <a href="/pedido/editar?id=${p.id}" class="btn-editar">Editar</a> | 
                <a href="/pedido/remover?id=${p.id}" class="btn-remover">Remover</a>
            </td>
        </tr>`
    ).join('') || '<tr><td colspan="6">Nenhum pedido registrado.</td></tr>';


    return render('pedidos', {
        mensagem: mensagem ? `<p style="color:red; font-weight: bold;">${mensagem}</p>` : `Editando Pedido ID: ${pedido.id}`,
        tituloForm: `Editar Pedido`,
        actionForm: '/pedido/atualizar', 
        
        itemId: pedido.id,
        itemDescricao: pedido.descricao,
        itemValorTotal: parseFloat(pedido.valor_total_venda).toFixed(2),
        
        botaoVoltar: '<a href="/pedidos">Cancelar Edição</a>',
        listaPedidos: lista,
        
    });
}
//Pedidos com Carrinho Unificado
async function renderPedidosComCarrinho(itensCarrinho, todosPedidos) {
    const linhasCarrinho = itensCarrinho.map(item => 
        `<tr>
            <td>${item.nome_produto}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
            <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>`
    ).join('') || '<tr><td colspan="4">Carrinho vazio.</td></tr>';

    const totalCarrinho = itensCarrinho.reduce((acc, item) => acc + parseFloat(item.subtotal), 0).toFixed(2);

    const linhasPedidos = todosPedidos.map(p => 
        `<tr>
            <td>${p.id}</td>
            <td>${p.descricao}</td>
            <td>R$ ${parseFloat(p.valor_total).toFixed(2)}</td>
            <td>${p.data_criacao ? new Date(p.data_criacao).toLocaleDateString() : 'N/A'}</td>
        </tr>`
    ).join('') || '<tr><td colspan="5">Nenhum pedido finalizado.</td></tr>';

    return render('pedidos', {
        linhasCarrinho: linhasCarrinho,
        totalCarrinho: `R$ ${totalCarrinho}`,
        linhasTabela: linhasPedidos,
        mensagem: ''
    });
}

//Relatorios de vendas
async function renderRelatorio(dataInicio = '', dataFim = '', pedidos = []) {
    
    const listaResultados = pedidos.map(p => 
        `<tr>
            <td>${p.id}</td>
            <td>R$ ${parseFloat(p.valor_total || p.valor_total_venda).toFixed(2)}</td> 
            <td>${p.descricao}</td>
            <td>${p.data_criacao ? new Date(p.data_criacao).toLocaleDateString() : 'N/A'}</td>
        </tr>`
    ).join('') || '<tr><td colspan="4">Nenhuma venda encontrada no período.</td></tr>';

    const totalVendas = pedidos.reduce((acc, p) => acc + parseFloat(p.valor_total || p.valor_total_venda), 0).toFixed(2);
    
    return render('relatorio', {
        dataInicio: dataInicio,
        dataFim: dataFim,
        listaResultados: listaResultados,
        totalVendas: `R$ ${totalVendas}`,
        mensagem: pedidos.length > 0 ? `Total de Vendas no Período: R$ ${totalVendas}` : 'Selecione as datas e clique em Filtrar.'
    });
}


module.exports = {
    renderFormulario,
    renderFinalizar,
    renderEditarProduto,
    renderFinancas,
    renderEditarFinancas,
    renderDetalhesFinancas,
    renderLogin,
    renderUsuarios,
    renderEditarEntrada,
    renderEditarSaida,
    renderPedidos,
    renderPedidosComCarrinho,
    renderEditarPedido,
    renderRelatorio,
    renderErro404,
    getListaClientesHtml
};