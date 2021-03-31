const socket = io();// se for com outro servidor coloca a URL, mas quando é o proprio não precisa
let username = '';
let user_list = [];

let login_page = document.querySelector('#login_page');
let chat_page = document.querySelector('#chat_page');

let login_input = document.querySelector('#login_name_input');
let text_input = document.querySelector('#chat_text_input');

login_page.style.display = 'flex';
chat_page.style.display = 'none';

function render_user_list() {
    let ul = document.querySelector('.user_list');
    ul.innerHTML = '';

    user_list.forEach(i => {
        ul.innerHTML += '<li>' + i + '</li>';
    });
}

function add_message(type, user, msg) {
    let ul = document.querySelector('.chat_list');

    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break;
        case 'msg':
            if (username == user) {

                ul.innerHTML += '<li class="m-txt"> <span class="me">' + user + '</span> ' + msg + '</li>';
            } else {

                ul.innerHTML += '<li class="m-txt"> <span>' + user + '</span> ' + msg + '</li>';
            }
            break;
    }

    ul.scrollTop = ul.scrollHeight;// deixar o scroll sempre no final
}
// quando der ENTER para entrar no chat
login_input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = login_input.value.trim();
        if (name != '') {
            username = name;
            //atualizar title
            document.title = 'Chat (' + username + ')';

            //envia mensagem
            socket.emit('join-request', username);

        } else {
            alert('Favor informar um nome!');
        }
    }
})
// quando der ENTRER para enviar mensagem no chat
text_input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = text_input.value.trim();
        if (txt != '') {
            text_input.value = ''; //limpar campo
            //adicionar mensagem na listagem
            add_message('msg', username, txt);
            //envia mensagem
            socket.emit('send-msg', txt);

        } else {
            alert('Favor informar uma mensagem para enviar!');
        }
    }
})

// espera a resposta user-ok
socket.on('user-ok', (list) => {
    login_page.style.display = 'none';
    chat_page.style.display = 'flex';
    text_input.focus();

    add_message('status', null, 'Conectado!');

    user_list = list;

    render_user_list();

});
// resposta para atualizar list de quem já esta logado
socket.on('list-update', (data) => {
    if (data.joined) {
        add_message('status', null, data.joined + ' entrou no chat');
    }

    if (data.left) {
        add_message('status', null, data.left + ' saiu do chat');
    }

    user_list = data.list;
    render_user_list();
});

// mensagem enviada pelo usuário
socket.on('show-msg', (data) => {
    add_message('msg', data.username, data.message);
});

// caso cair conexão servidor
socket.on('disconnect', () => {
    add_message('status', null, 'Você foi desconectado!');

    user_list = [];
    render_user_list();
});

// ficar tentando conectar
socket.on('connect_error', (error) => {
    add_message('status', null, 'Tentando reconectar...');
});

// caso conseguir reconectar
socket.on('connect', () => {

    if (username != '') {

    add_message('status', null, 'Conexão restabelecida!');

        socket.emit('join-request', username);
    }
});