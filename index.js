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



// variables 
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.1.109:3000",
    "http://192.168.1.111:3000",
    "https://whatsapp-frontend-lake.vercel.app"

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

app.use("/api/v1/login", require("./routes/login"));
app.use("/api/v1/register", require("./routes/register"));
app.use("/api/v1/friends", require("./routes/friends"));
app.use("/api/v1/chat", require("./routes/chat"));
app.use("/api/v1/profile", require("./routes/profile"));

// server listening
server.listen(PORT, () => {
    console.log('Server is up on port 4000.')
});


const wss1 = new ws.Server({ noServer: true });
const { handleChat } = require("./websocket/chats")
app.get('/chat', (req, res) => {
    wss1.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => handleChat(ws, wss1));
});

const wss2 = new ws.Server({ noServer: true });
const { handleVideo } = require("./websocket/video")
app.get('/video', (req, res) => {
    wss2.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => handleVideo(ws, wss2));
});


// websockets 1 chats
// const wss1 = new ws.Server({ noServer: true,path: '/chat'});

// wss1.on('connection', (ws) => handleChat(ws, wss1));

// websockets 2 video
// const wss2 = new ws.Server({ noServer: true, path: '/video'});
// wss2.on('connection', (ws) => handleVideo(ws, wss2));


