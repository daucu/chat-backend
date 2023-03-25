const router = require('express').Router();
const Chat = require('../models/chat_schema');
const User = require('../models/user_schema');
const { getAuthUser } = require("../config/authorizer")
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

// sender: arman
// rec: rishab

// send: rishab
// rec: arman

// create new chat
router.post('/', getAuthUser, async (req, res) => {
    try {
        const user = req.user;
        const newChat = new Chat({
            ...req.body,
            sender: user._id
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