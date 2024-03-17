import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const users: Record<string, string> = {}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  const onlineUsers: string[] = []

  for (const [username, socketId] of Object.entries(users)) {
    if (socketId === socket.id) {
      onlineUsers.push(username)
    }
  }

  socket.emit('users', onlineUsers)

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

    for (const [username] of Object.entries(users)) {
      if (users[username] === socket.id) {
        socket.broadcast.emit('user disconnected', { username: users[socket.id] })
        delete users[username]
        break
      }
    }

    delete users[socket.id]
  })

  socket.on('join room', (obj) => {
    const { username, room } = obj
    socket.join(room)

    socket.broadcast.to(room).emit('new message', {
      username: users[socket.id] || username,
      text: `${users[socket.id] || username} has joined the room`,
    })

    socket.emit('message', {
      username: users[socket.id] || username,
      text: 'You have joined the room.',
    })

    users[socket.id] = username
  })

  socket.on('send message', (message) => {
    const { room, text } = message

    if (room) {
      socket.to(room).emit('new message', {
        username: users[socket.id] as string,
        text,
      })
    } else {
      io.emit('new message', {
        username: users[socket.id] as string,
        text,
      })
    }
  })
})

const PORT = 8000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})