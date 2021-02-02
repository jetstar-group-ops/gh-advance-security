
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
//Get username and room
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

//Join chat room

socket.emit('joinRoom', {
    username,
    room
})

//Get room and users
socket.on('roomusers', ({room, users}) => {
    console.log(room)
    console.log(users)
    outputRoomName(room);
    outputUsers(users);
})
//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatForm.addEventListener('submit', (e) => {

    e.preventDefault();
    const msg =  e.target.elements.msg.value;
    //Emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output message to DOM

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
            <p class="meta">${message.username}<span> ${message.time}</span></p>
			<p class="text">${message.text}</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}


function outputRoomName(room) {
     roomName.innerText = room
}

function outputUsers(users) {
     
     let innerHTML = ``
     users.forEach(user => {
        innerHTML = innerHTML + `<li>${user.username}</li>`
     });
     userList.innerHTML = innerHTML;

    //  userList.innerHTML = `
    //  ${users.map(user => `${user.username}</li>`).join('')}
    //  `

}