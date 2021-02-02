const express = require('express');
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessge = require('./utils/messages.js')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users.js')


const app = express();
const server = http.createServer(app)
const io = socketio(server)


//SET STATIC folder

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Admin'
//Run when client connect
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        
        const user = userJoin(socket.id,username, room)
        socket.join(user.room)
        //Welcome
        socket.emit('message', formatMessge(botName, 'Welcome to chat room'))

        //Broadcast when user connect
        socket.broadcast.to(user.room).emit('message', formatMessge(botName, `${user.username} has joined the chat`))
        
        io.to(user.room).emit('roomusers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        //listen for chat message
        socket.on('chatMessage', (message) => {
            const user = getCurrentUser(socket.id)
            io.to(user.room).emit('message', formatMessge(user.username, message))
        })
        //Runs when client disconnects
        socket.on('disconnect', () => {
            const user =  userLeave(socket.id)
            if (user) {
                io.to(user.room).emit('message', formatMessge(botName, `${user.username} has left the chat`))
                io.to(user.room).emit('roomusers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }
        })
    })

})
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})