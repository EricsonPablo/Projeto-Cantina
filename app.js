const http = require('http');
const rotas = require('./rotas');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {

    if (req.url.startsWith('/public/')){
        const filePath = path.join(__dirname, req.url);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Erro interno');
                return;
            }

            const ext = path.extname(filePath).toLocaleLowerCase();
            const tipos = {
                '.css': 'text/css',
                '.js': 'text/javaScript'
            };
            
            res.writeHead(200, {'Content-Type': tipos[ext] || 'text/plain'})
            res.end(data);
        });
        return;
    }
    rotas(req, res);
});

server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000 ou http://127.0.0.1:3000');
});
