const router = require('express').Router();
const Chat = require('../models/chat_schema');
const User = require('../models/user_schema');
const { getAuthUser } = require("../config/authorizer");
const { buffToJson, sendToWs } = require('../functions');
const { joinUser, sendToUser } = require('../websocket/user');
const { createRoom, joinRoom, sendToRoom } = require('../websocket/room');
const { Server } = require('ws');

let websocket = null;

const wss = new Server({ noServer: true });

router.get("/ws", (req, res) => {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0),
        (ws) => {
            // websocket 
            websocket = ws;

            console.log("New Chat connection");
            ws.on('message', (message) => {
                // data to json 
                const data = buffToJson(message);

                // if error throw invalid json
                if (data.error) {
                    return sendToWs(ws, {
                        error: true,
                        message: "Invalid JSON"
                    });
                }

                // message type 
                const { type } = data;

                // handle message by switch case
                switch (type) {

                    // join user
                    case "join":
                        console.log("new user " + data._id + " joined");
                        joinUser(ws, data);
                        break;

                    default:
                        break;
                }
            });
        });
});


// get all chats 
router.get('/:receiver', getAuthUser, async (req, res) => {
    try {
        const user = req.user;
        const { receiver } = req.params;
        const chats = await Chat.find({
            $or: [
                {
                    sender: user._id,
                    receiver: receiver
                },
                {
                    sender: receiver,
                    receiver: user._id
                }
            ]
        }).populate([
            {
                path: "sender",
                select: "-password -otp"
            }
        ]);



        return res.status(200).json(chats);
    } catch (error) {
        return res.status(500).json(error);
    }
});

router.post('/', getAuthUser, async (req, res) => {
    try {
        const user = req.user;

        const { reciever, message } = req.body;

       

        wss.clients.forEach((client) => {
            if (client.id === reciever) {
                sendToWs(client, {
                    sender: user,
                    reciever: reciever,
                    message: message,
                    type: "send-to-user",
                    messageType: "text",
                    time: new Date().toISOString(),
                    seen: false,
                })
            }
        })

        const newChat = new Chat({
            ...req.body,
            receiver: reciever,
            message: message,
            messageType: "text",
            chat_message_type: "normal",
            sender: user._id,
            seen: false,
        });


        const savedChat = await newChat.save();
        return res.status(200).json(savedChat);
    } catch (error) {
        return res.status(500).json(error);
    }
});

// delete chat
router.delete('/:id', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (chat.sender === req.body.userId || chat.receiver === req.body.userId) {
            await chat.delete();
            return res.status(200).json("Chat has been deleted");
        } else {
            return res.status(403).json("You can delete only your chats");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});


module.exports = router;