// Creating the server
const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

// for formatting the msgs - sending the object
const formatMessage = require('./utils/messages')

const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

// To use all the html/css files
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'

// Run when client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ( {username , room}) => {
        
        const user = userJoin(socket.id, username, room)
        
        socket.join(user.room)
        
        // Whenever connection happens, it send the msg to the
        // front - end in message parameter to current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))
    
        // telling everybody except the user which has connected (to specific room)
        socket.broadcast.
        to(user.room).
        emit('message', formatMessage(botName, `${user.username} has joined the chat`));
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users: getRoomUsers(user.room)
        })
    })

    
    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        // console.log(msg)
        
        // get the current user
        const user = getCurrentUser(socket.id)

        // sending to everybody
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })


    // Runs when client disconnects;
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user){
            // telling everyone
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
        }

        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users: getRoomUsers(user.room)
        })
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT,  () => console.log(`Server running on ${PORT}`))
