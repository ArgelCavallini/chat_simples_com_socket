const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const oi = socketIO(server);

server.listen(3000);

// MANDAR LER A PASTA PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

let connected_users = [];

// ESCUTADOR
// QUANDO EXISTIR ALGUMA CONEXÃO
oi.on('connection', (socket) => {
    console.log("Conexão detectada...");

    // USUÁRIO CONECTANDO NO CHAT
    socket.on('join-request', (username) => {
        socket.username = username;
        // adiciona o nome na lista
        connected_users.push(username);
        console.log(connected_users);

        //resposta para usuário que esta logando
        socket.emit('user-ok', connected_users);

        //resposta para todos usuários já logados
        socket.broadcast.emit('list-update', {
            joined: username,// quem entrou
            list: connected_users
        });
    });
    // USUÁRIO DESCONECTADO DO CHAT
    socket.on('disconnect', () => {
        //remover usuário desconectado username
        connected_users = connected_users.filter(u => u != socket.username);

        console.log(connected_users);

        socket.broadcast.emit('list-update', {
            left: socket.username,// quem saiu
            list: connected_users
        });
    });
    // MENSAGEM ENVIADA AO APERTAR ENTER
    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };
        //devolve para quem enviou
        //socket.emit('show-msg', obj);

        //envia para os demais logados
        socket.broadcast.emit('show-msg', obj);
    });
});
