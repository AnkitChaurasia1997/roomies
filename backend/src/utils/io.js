import { Server, Socket } from "socket.io";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Group } from "../models/group.model.js";


const initSocketIO = (server) => {
    const io = new Server(server);

    const uns = io.of('/user-namespace');

    uns.on('connection', async function(socket){
        console.log('User connected');
        console.log(socket.handshake.auth.token);
        const userID = socket.handshake.auth.token
        let groupID = null;
        if (!(await User.findByIdAndUpdate({_id: userID}, {$set: {is_online: true}}))) {
            groupID = socket.handshake.auth.token;
            await Group.findByIdAndUpdate({_id: groupID}, {$set: {is_online: true}});
          }

        socket.broadcast.emit('getOnlineUser', { user_id : userID});

        socket.on('disconnect', async function(){
            console.log('user disconnected')

            if (!(await User.findByIdAndUpdate({_id: userID}, {$set: {is_online: false}}))) {
                await Group.findByIdAndUpdate({_id: groupID}, {$set: {is_online: false}});
              }

            socket.broadcast.emit('getOfflineUser', { user_id : userID});

        });

        //chatting implementation
        socket.on('newChat', function(data){
            console.log(data);
            socket.broadcast.emit('loadNewChat', data)
        });

        //load Old Chats
        socket.on('existsChat', async function(data) {
            const chats = await Chat.find({ $or: [
                {
                    sender_id : data.sender_id,
                    receiver_id : data.receiver_id
                },
                {
                    sender_id : data.receiver_id,
                    receiver_id : data.sender_id
                }
            ]});

            socket.emit('loadChats', {
                chats : chats
            });
        })

    });

}

export default initSocketIO;



