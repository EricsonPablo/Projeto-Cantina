    //TESTE A IMPORTACAO
    // const pagina = require('./views/pagina');

const fs = require('fs');
const path = require('path')

const { renderFormulario, renderFinalizar, renderFinancas, renderEditarFinancas, renderEditarProduto, renderDetalhesFinancas, renderPedidos, renderPedidosComCarrinho, renderLogin, renderEditarEntrada, renderEditarSaida, renderRelatorio, renderEditarPedido, renderErro404 } = require('./views/pagina');
const carrinho = require('./DADOS/carrinhoDAO');
const financas = require('./DADOS/financasDAO');
const produtoDAO = require('./DADOS/produtoDAO');
const pedidoDAO = require('./DADOS/pedidoDAO');
const usuarioDAO = require('./DADOS/usuarioDAO');
const { URLSearchParams } = require('url');

module.exports = async (req, res) => {
    console.log(req.method, req.url);
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
        /*render formulario retorna os dados o html do produto*/
        const itensCarrinho = await carrinho.listarItensComDetalhes();
        const htmlComProdutos = await renderFormulario(itensCarrinho);


        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlComProdutos);
    }

    else if (req.method === 'POST' && url.pathname === '/salvar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));
            await produtoDAO.adicionar(
                dados.nome,
                dados.descricao,
                parseFloat(dados.preco)
            )
        
            res.writeHead(302, { Location: '/' });
            res.end();
        });
    }

    else if (req.method === 'POST' && url.pathname === '/limpar') {
        let body = '';
        req.on('data', chunk => body += chunk);
            req.on('end', async () => { 
            if (await carrinho.estaVazio()) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(await renderFormulario([], 'Carrinho já está vazio.'));
            } else {
                await carrinho.limpar();
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(await renderFormulario([], 'Carrinho limpo com sucesso.'));
            }
        });
    }

    else if (req.method === 'POST' && url.pathname === '/finalizar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            if (await carrinho.estaVazio()) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(await renderFormulario([], 'Carrinho ainda está vazio.'));
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(await renderFinalizar());
            }
        });
    }
        
    else if (req.method === 'GET' && url.pathname === '/produto/editar'){
        const id = url.searchParams.get('id');
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end(await renderEditarProduto(id));
    }
    else if (req.method === 'POST' && url.pathname === '/produto/atualizar'){
        let body = ''
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
        const dados = Object.fromEntries(new URLSearchParams(body));
                await produtoDAO.atualizar(
                parseInt(dados.id),
                dados.nome,
                dados.descricao,
                    parseFloat(dados.preco)
            );
            res.writeHead(302, { Location: '/' });
            res.end();
        })
    }
    else if (req.method === 'GET' && url.pathname === "/produto/remover"){
        const id = url.searchParams.get('id'); //pega o id
        await produtoDAO.remover(id); //chama a função
        res.writeHead(302, {Location: '/'});
        res.end();
    }
    else if (req.method === 'GET' && url.pathname === '/carrinho/adicionar') {
        const id_produto = parseInt(url.searchParams.get('id_produto'));
        const quantidade = parseInt(url.searchParams.get('quantidade')) || 1;
        
        if (isNaN(id_produto)) {
            res.writeHead(302, { Location: '/pedidos' });
            res.end();
            return;
        }
        
        await carrinho.adicionar(id_produto, quantidade);
        res.writeHead(302, { Location: '/pedidos' });
        res.end();
    }
    else if (req.method === 'GET' && url.pathname === '/financas') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(await renderFinancas());
    }
    // ROTA POST: Adicionar Novo Cliente (DELETE)
    else if (req.method === 'POST' && url.pathname === '/financas/adicionar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));
            await financas.adicionarCliente(
                dados.nome, 
                dados.curso, 
                dados.cpf, 
                dados.nome_responsavel, 
                parseFloat(dados.valor_atual)
            );
            res.writeHead(302, { Location: '/financas' });
            res.end();
        });
    }
    // ROTA GET: Carregar Formulário para Edição (READ de item único)
    else if (req.method === 'GET' && url.pathname === '/financas/editar') {
        const id = parseInt(url.searchParams.get('id'), 10);
        if (isNaN(id)) {
            // ID inválido: volta para a lista de finanças
            res.writeHead(302, { Location: '/financas' });
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(await renderEditarFinancas(id));
    }
    // ROTA POST: Salvar Edições (UPDATE)
     else if (req.method === 'POST' && url.pathname === '/financas/atualizar') {
        let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const dados = Object.fromEntries(new URLSearchParams(body));
            
            // 1. Extração dos dados com os nomes CORRETOS (que batem com o HTML)
            const id = parseInt(dados.id);
            const { nome, curso, cpf, nome_responsavel } = dados; 
            const valor_atual_float = dados.valor_atual ? parseFloat(dados.valor_atual) : 0; 
            
            console.log('CHEGOU NA ROTA ATUALIZAR. ID:', id);
            console.log(dados); // Verifique se 'id' está presente e não 'undefined'

            // 2. Chamada ao DAO
            const affected = await financas.atualizarCliente(
                id, 
                nome, 
                curso, 
                cpf, 
                nome_responsavel, 
                valor_atual_float
            );
            
            console.log(`Atualização afetou ${affected} linhas.`);

            res.writeHead(302, { Location: '/financas' });
            res.end();
            
        } catch (error) {
            console.error('ERRO NA ATUALIZAÇÃO DE FINANÇAS:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno ao atualizar cliente.');
        }
    });
}

// ROTA GET: Remover Cliente (DELETE)
else if (req.method === 'GET' && url.pathname === '/financas/remover') {
        const id = url.searchParams.get('id');
    await financas.removerCliente(id);
    res.writeHead(302, { Location: '/financas' });
    res.end();
}

else if (req.method === 'GET' && url.pathname === '/financas/transacoes') {
    const id = parseInt(url.searchParams.get('id'), 10);
    if (isNaN(id)) {
        res.writeHead(302, { Location: '/financas' });
        res.end();
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(await renderDetalhesFinancas(id));
}
//Salvar entrada
else if(req.method === 'POST' && url.pathname === '/financas/entrada/adicionar'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        const dados = Object.fromEntries(new URLSearchParams(body));
        const idFinancas = parseInt(dados.id_financas);
        await financas.adicionarEntrada(
            idFinancas,
            parseFloat(dados.valor_recebido),
            dados.responsavel_pagamento
        )
        res.writeHead(302, {Location: '/financas/transacoes?id=' + idFinancas});
        res.end();
    })
}
else if(req.method === 'POST' && url.pathname === '/financas/saida/salvar'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try{
            const dados = Object.fromEntries(new URLSearchParams(body));
            
            const idFinancasCliente = parseInt(dados.id_financas);
            const valorSaida = parseFloat(dados.valor_saida);

            //validação   isNaN verifica se o valor é um número
            if (isNaN(idFinancasCliente) || isNaN(valorSaida)) {
                res.writeHead(302, { Location: `/financas/transacoes?id=${idFinancasCliente}&mensagem=Dados inválidos para Saída`});
                return res.end();
                }
                //Registrar saída e atualizar o saldo
                await financas.adicionarSaida(idFinancasCliente, valorSaida);
                
                res.writeHead(302, { Location: '/financas/transacoes?id=' + idFinancasCliente});
                res.end();
            } catch (error) {
                console.error('Erro ao processar Saída Financeira:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain'});
                res.end('Erro interno ao salvar');
            }
            
        })
        //carrecar formulario
    } else if(req.method === 'GET' && url.pathname.startsWith('/financas/entrada/editar')){
        const id_transacao = url.searchParams.get('id');

        const entrada = await financas.obterEntradasPorId(id_transacao);

        if(entrada) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(await renderEditarEntrada(entrada.id));
        } else {
        res.writeHead(404, { 'Content-Type': 'text/html'});
        res.end('Entrada não encontrada')
        }
        //atualizar Entrada
    } else if (req.method === 'POST' && url.pathname === '/financas/entrada/atualizar'){
        let body = ''
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));
            
            const idTransacao = parseInt(dados.id_transacao);
            const idFinancas = parseInt(dados.id_financas);
            const valorRecebido = parseFloat(dados.valor_recebido);
            
            await financas.atualizarEntrada(
                idTransacao,
                idFinancas,  
                valorRecebido,
                dados.responsavel_pagamento
            );
            res.writeHead(302, {Location: '/financas/transacoes?id=' + idFinancas});
            res.end()
        })
        //remover entrada
    } else if(req.method === 'GET' && url.pathname === '/financas/entrada/remover') {
        const id = url.searchParams.get('id'); // ID da Entrada (transação)
        const clienteId = url.searchParams.get('clienteId'); // ID do Cliente (para redirecionar de volta)

        if (clienteId) {
            // Assumindo que você tem uma função 'removerEntrada' no seu DAO de financas
            await financas.removerEntrada(id); 
            res.writeHead(302, { Location: '/financas/transacoes?id=' + clienteId });
        } else {
            // Se não tiver o ID do cliente, volta para a lista de clientes
            res.writeHead(302, { Location: '/financas'});
        }
        res.end();
    } else if(req.method === 'GET' && url.pathname === '/financas/saida/editar'){
        const id = url.searchParams.get('id'); // ID da Saída
            
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(await renderEditarSaida(id));
    } else if (req.method === 'POST' && url.pathname === '/financas/saida/atualizar'){
        let body = ''
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));

            const idTransacao = parseInt(dados.itemId); // ID da Saída
            const idFinancas = parseInt(dados.clienteId); // ID do Cliente
            const valorSaida = dados.itemValor ? parseFloat(dados.itemValor) : 0

            await financas.atualizarSaida(
                idTransacao, 
                idFinancas,
                valorSaida
            );

            res.writeHead(302, {Location: '/financas/transacoes?id=' + idFinancas});
            res.end()
        })
    } else if (req.method === 'POST' && url.pathname === '/pedido/salvar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const itensDoCarrinho = await carrinho.listarItensComDetalhes();
                if (itensDoCarrinho.length === 0) {
                    res.writeHead(302, { Location: '/?mensagem=Carrinho vazio. Adicione produtos antes de finalizar.' });
                    return res.end();
                }

                // Insere cada item do carrinho como um pedido separado
                for (const item of itensDoCarrinho) {
                    await pedidoDAO.adicionar(item.nome_produto, item.quantidade, item.subtotal);
                }

                await carrinho.limpar();
                
                res.writeHead(302, { Location: '/?mensagem=Pedido salvo com sucesso!' });
                res.end();
            } catch (error) {
                console.error('Erro ao salvar o pedido:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erro interno ao processar o pedido.');
            }
        });
        // ROTA POST: Autenticar Login
    } else if (req.method === 'POST' && url.pathname === '/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));
                const usuarioAutenticado = await usuarioDAO.autenticar(dados.login, dados.senha);
            if (usuarioAutenticado) {
                res.writeHead(302, { Location: '/' });
                res.end();
            } else {
                res.writeHead(302, { Location: '/?erro=Credenciais inválidas' }); 
                res.end();
            }
        });
    } else if (req.method === 'GET' && url.pathname === '/logout') {
        res.writeHead(302, { Location: '/' });
        res.end();
    } else if (req.method === 'GET' && url.pathname === '/pedidos') {
        const itensCarrinho = await carrinho.listarItensComDetalhes();
        const todosPedidos = await pedidoDAO.obterTodos();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(await renderPedidosComCarrinho(itensCarrinho, todosPedidos)); 
    } else if (req.method === 'GET' && url.pathname === '/pedido/editar') {
        const id = url.searchParams.get('id');
        const pedido = await pedidoDAO.obterPorId(id);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Você precisará de uma função de renderização específica (renderEditarPedido)
        res.end(await renderEditarPedido(pedido)); 
    } else if (req.method === 'POST' && url.pathname === '/pedido/atualizar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const dados = Object.fromEntries(new URLSearchParams(body));
            
            await pedidoDAO.atualizar(
                parseInt(dados.id),
                dados.nomeProduto,
                parseInt(dados.quantidade),
                parseFloat(dados.valor_total)
            );

            res.writeHead(302, { Location: '/pedidos' });
            res.end();
        });
    } // ROTA GET: Remover Pedido
    else if (req.method === 'GET' && url.pathname === '/pedido/remover') {
        const id = url.searchParams.get('id');
            await pedidoDAO.remover(id);
        res.writeHead(302, { Location: '/pedidos' });
        res.end();
    } else if (req.method === 'GET' && url.pathname === '/relatorio/vendas') {
        // Apenas renderiza a página vazia com o formulário de filtro
        const relatorioHTML = await renderRelatorio(); 
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(await renderRelatorio());
    } else if (req.method === 'POST' && (url.pathname === '/relatorio/vendas' || url.pathname === '/relatorio/vendas/filtrar')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const dados = Object.fromEntries(new URLSearchParams(body));
                const dataInicio = dados.dataInicio;
                const dataFim = dados.dataFim;
                
                // 1. Busca os dados
                const pedidos = await pedidoDAO.relatorioVendas(dataInicio, dataFim);
                
                // 2. Renderiza a view, passando os dados do formulário e os resultados
                const relatorioHTML = await renderRelatorio(dataInicio, dataFim, pedidos); 
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(relatorioHTML);
            } catch (error) {
                console.error('Erro ao gerar relatório de vendas:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erro interno ao gerar o relatório.');
            }
        });
    }

else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
}
};
