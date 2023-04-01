const { buffToJson, sendToWs } = require("../functions");

const handleCallUserRequestTo = (data, ws, wss) => {
    const { token, to } = data;
    const user = getAuthUser(token);
    console.log(user);
    console.log(to);
}

const handleVideo = (ws, wss) => {
    console.log("New Video connection");

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
            case "call-user-request":
                handleCallUserRequestTo(data, ws, wss);
                break;

            default:
                break;
        }
    });
}


module.exports = {
    handleVideo
}