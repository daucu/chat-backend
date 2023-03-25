require("dotenv").config();
require("./config/db")();

// packages 
const express = require('express')
const http = require('http')
const ws = require('ws')
const cors = require('cors')

//express and http app
const app = express();
const server = http.createServer(app);

// sockets 
const wss1 = new ws.Server({ 
    server,
    path: '/chat'
});

// variables 
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
    "http://localhost:3000"
];

// middlewares 
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json());
app.use(express.static(__dirname + "/public"));



// routes 
app.get('/', (req, res) => {
    res.send('Hello World!')
});
app.get('/api', (req, res) => {
    res.send('api is working')
});

app.use("/api/login", require("./routes/login"));
app.use("/api/register", require("./routes/register"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/chat", require("./routes/chat"));

// server listening
server.listen(PORT, () => {
    console.log('Server is up on port 4000.')
});



// websockets 
const { handleChat } = require("./websocket/chats")
wss1.on('connection', (ws) => handleChat(ws, wss1));


