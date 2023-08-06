const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// console.log(username, room)

// see chat.html
const socket = io()

// Join chatroom (sending to server)
socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// it access the message sent by the socket from the server
socket.on('message', (message) => {
    console.log(message)

    // Now printing what is received from the server
    outputMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight

})

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // get msg text
    const msg = e.target.elements.msg.value

    // Emit msg to the server
    // console.log(msg)
    socket.emit('chatMessage', msg)

    // After sending to the server
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// Output message to DOM
function outputMessage(message) {
    // creating the new div
    const div = document.createElement('div')

    // div of class - message
    div.classList.add('message')

    // adding html
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`

    // appending to the html file
    document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room
}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}