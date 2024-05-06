import mongoose from "mongoose";


const options = {
    discriminatorKey: 'kind',
    _id: false
  };
  
  const chatSchema = new mongoose.Schema({
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender_id_type'
    },
    sender_id_type: {
      type: String,
      required: true,
      enum: ['User', 'Group']
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiver_id_type'
    },
    receiver_id_type: {
      type: String,
      required: true,
      enum: ['User', 'Group']
    },
    message: {
      type: String,
      required: true
    }
  }, { timestamps: true, ...options });



export const Chat = mongoose.model('Chat', chatSchema);