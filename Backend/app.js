const express = require("express")
const http = require("http")
const socketio = require("socket.io")

const app = express()
const server = http.createServer(app)


const io = socketio(server)


app.get("/", (req, res) => {
    res.send("hello")
})

io.on("connection", function(socket) {
    socket.on("send-location", function (data) {
        io.emit("recieve-location", { id: socket.id, ...data})
    })
    console.log("connected");
})

server.listen(3000)
