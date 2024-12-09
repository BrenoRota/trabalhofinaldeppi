const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'chatappsecret',
    resave: false,
    saveUninitialized: true
}));

let users = [];
let messages = [];

function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'logar', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        req.session.user = { username };
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

function menu() {
    return `
        <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #24243e;">
            <div class="container-fluid">
                <a class="navbar-brand" href="/" style="color: #00d4ff;">Menu</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="/cadastroUsuario" style="color: #00d4ff;">Cadastro de Usuários</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/chat" style="color: #00d4ff;">Bate-papo</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/logout" style="color: #00d4ff;">Sair</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

app.get('/', checkLogin, (req, res) => {
    const user = req.session.user;

    // Captura o último acesso do cookie
    const lastAccess = req.cookies.lastAccess || "Nunca";

    // Atualiza o cookie com o novo acesso
    res.cookie('lastAccess', new Date().toLocaleString());

    // Renderiza a página com o valor correto de "Último acesso"
    res.send(`
        <html>
            <head>
                <title>Menu</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);">
                ${menu()}
                <div class="container mt-5" style="color: #f5f5f5;">
                    <h2>Bem-vindo, ${user.username}</h2>
                    <p>Último acesso: ${lastAccess}</p>
                    <div class="btn-group" role="group" aria-label="Menu de navegação">
                        <a href="/cadastroUsuario" class="btn" style="background-color: #00d4ff; color: white;">Cadastro de Usuários</a>
                        <a href="/chat" class="btn" style="background-color: #0077b6; color: white;">Bate-papo</a>
                        <a href="/logout" class="btn" style="background-color: #ff4b5c; color: white;">Sair</a>
                    </div>
                </div>
            </body>
        </html>
    `);
});


app.get('/cadastroUsuario', checkLogin, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Cadastro de Usuário</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);">
                ${menu()}
                <div class="container mt-5" style="color: #f5f5f5;">
                    <h1>Cadastro de Usuário</h1>
                    <form action="/cadastrarUsuario" method="POST">
                        <div class="mb-3">
                            <label for="nome" class="form-label" style="color: #00d4ff;">Nome</label>
                            <input type="text" class="form-control" id="nome" name="nome" required>
                        </div>
                        <div class="mb-3">
                            <label for="dataNascimento" class="form-label" style="color: #00d4ff;">Data de Nascimento</label>
                            <input type="date" class="form-control" id="dataNascimento" name="dataNascimento" required>
                        </div>
                        <div class="mb-3">
                            <label for="nickname" class="form-label" style="color: #00d4ff;">Nickname</label>
                            <input type="text" class="form-control" id="nickname" name="nickname" required>
                        </div>
                        <button type="submit" class="btn" style="background-color: #00d4ff; color: white;">Cadastrar</button>
                    </form>
                </div>
            </body>
        </html>
    `);
});

app.post('/cadastrarUsuario', checkLogin, (req, res) => {
    const { nome, dataNascimento, nickname } = req.body;
    if (nome && dataNascimento && nickname) {
        users.push({ nome, dataNascimento, nickname });
        res.send(`
            <html>
                <head>
                    <title>Cadastro Realizado</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #f5f5f5;">
                    ${menu()}
                    <div class="container mt-5">
                        <h1>Cadastro realizado com sucesso!</h1>
                        <a href="/cadastroUsuario" class="btn" style="background-color: #00d4ff; color: white;">Voltar ao cadastro</a>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send('<h1>Erro: Todos os campos devem ser preenchidos.</h1>');
    }
});

app.get('/chat', checkLogin, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Bate-papo</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body style="background-color: #f8f9fa;">
                ${menu()}
                <div class="container mt-5" style="color: #24243e;">
                    <h1>Bate-papo</h1>
                    <form action="/postarMensagem" method="POST">
                        <div class="mb-3">
                            <label for="usuario" class="form-label" style="color: #0077b6;">Selecione um usuário:</label>
                            <select class="form-control" name="usuario" required>
                                <option value="">Selecione um usuário</option>
                                ${users.map(user => `<option value="${user.nickname}">${user.nickname}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="mensagem" class="form-label" style="color: #0077b6;">Mensagem</label>
                            <textarea class="form-control" id="mensagem" name="mensagem" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn" style="background-color: #00d4ff; color: white;">Enviar</button>
                    </form>
                    <div class="mt-5">
                        <h3>Mensagens</h3>
                        <ul style="list-style: none; padding-left: 0;">
                            ${messages.map(msg => `<li style="background-color: #e9ecef; padding: 10px; margin-bottom: 10px; border-radius: 5px;"><b>${msg.usuario}:</b> ${msg.texto} <span class="text-muted">[${msg.dataHora}]</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            </body>
        </html>
    `);
});

app.post('/postarMensagem', checkLogin, (req, res) => {
    const { usuario, mensagem } = req.body;
    if (usuario && mensagem) {
        const dataHora = new Date().toLocaleString();
        messages.push({ usuario, texto: mensagem, dataHora });
        res.redirect('/chat');
    } else {
        res.send('<h1>Erro ao enviar mensagem. Tente novamente.</h1>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('lastAccess');
    res.redirect('/login');
});

const port = 4001;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
