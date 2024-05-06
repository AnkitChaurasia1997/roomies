import mongoose from "mongoose";


  
  const chatSchema = new mongoose.Schema({
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderType'
    },
    senderType: {
      type: String,
      // required: true,
      enum: ['User', 'Group']
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverType'
    },
    receiverType: {
      type: String,
      // required: true,
      enum: ['User', 'Group']
    },
    message: {
      type: String,
      required: true
    }
  }, { timestamps: true} );


export const Chat = mongoose.model('Chat', chatSchema);