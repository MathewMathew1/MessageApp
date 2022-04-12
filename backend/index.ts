import express from 'express'
import { Pool } from 'pg'
import pg from "pg"
import router from './Api/route'
import AuthenticationDAO from './dao/authenticationDAO'
import MessageDAO from './Dao/messageDao'
import ChannelDAO from './Dao/channelsDao'
import InviteDAO from './Dao/inviteDao'
import EmojiReactionDAO from './Dao/emojiReactionDao'
import bodyParser from 'body-parser'
import { Server } from "socket.io";

import cors from "cors"
import dotenv from "dotenv"
import { instrument } from "@socket.io/admin-ui"
import friendInviteListener from './Listeners/FriendInviteListeners'
import FriendDao from './Dao/friendsDao'
import FriendCtrl from './Api/friend'
import FriendInviteCtrl from './Api/friendInvite'
import FriendInviteDao from './Dao/friendsInvitesDao'
import { FriendUser } from './types/types'

const app = express()
const PORT = 8000
app.use(express.json())
app.use(bodyParser.json())
app.use(cors({origin: ["http://localhost:3000","https://socket.io"]}))

dotenv.config()

app.use("/api/v1/", router)
app.use("*", (_req, res) => res.status(404).json({error: "Not found"}))




const server = app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","https://admin.socket.io"]
  }
})

io.use(async function(socket, next){
  
  if (socket.handshake.query && socket.handshake.query.token){
    if(typeof socket.handshake.query.token !== "string") return
    
    const token: string = socket.handshake.query.token.split(' ')[1]
    let user= await AuthenticationDAO.setUser(token) 

    if (!user|| user.error) return next(new Error('Authentication error'));
      user.id = parseInt(user.id)
      socket.user = user
      
      let friends = await FriendDao.getUserFriendships(user.id)
      let socketsOfFriendUsers: string[] = []
            
      io.sockets.sockets.forEach(function(data,_counter){
        if(data.user.id===user.id) return

        const index = friends.friendships.findIndex((obj: FriendUser) => 
          {return parseInt(obj.user_one_id) === data.user.id || parseInt(obj.user_two_id) === data.user.id})
        if(index===-1) return

        socketsOfFriendUsers.push(data.id)
          
      })
      if(socketsOfFriendUsers.length!==0) {
        io.to(socketsOfFriendUsers).emit("friend-status-changed", {userId: user.id, isOnline: true})
      }

      next();
  }
  else {
    next(new Error('Authentication error'));
  }    
  })
  .on("connection", (socket: any) => {
    socket.on("join-chatroom", (room: string) => {
      if(isNaN(parseInt(room))){
        console.log("error Lies there")
        return 
      }
      const joinRoom = async () => {

        let response = await ChannelDAO.checkIfUserInChannel(parseInt(socket.user.id), parseInt(room))

        if(response.isUserInChannel) socket.join(room)
      }

      joinRoom()
      
    })


    socket.on("leave-chatroom", (room: string) => {
      
      const leaveRoom = async () => {
        socket.leave(room)
      }

      leaveRoom()
    
    })
  
    socket.on("disconnect", (reason: any) => {

      const notifyFriendAboutDisconnection = async () => {
        let friends = await FriendDao.getUserFriendships(socket.user.id)
        let socketsOfFriendUsers: string[] = []
        let areThereAnyOtherSocketsOfDisconnectingUser = false
              
        io.sockets.sockets.forEach(function(data,_counter){
          if(areThereAnyOtherSocketsOfDisconnectingUser) return
          
          if(data.user.id=== socket.user.id) {
            areThereAnyOtherSocketsOfDisconnectingUser = true
            return 
          }  

          const index = friends.friendships.findIndex((obj: FriendUser) => 
            {return parseInt(obj.user_one_id) === data.user.id || parseInt(obj.user_two_id) === data.user.id})
          if(index===-1) return

          socketsOfFriendUsers.push(data.id)
          return true
        })
        if(socketsOfFriendUsers.length!==0 && !areThereAnyOtherSocketsOfDisconnectingUser) {
          io.to(socketsOfFriendUsers).emit("friend-status-changed", {userId: socket.user.id, isOnline: false})
        }
    }

    notifyFriendAboutDisconnection()  

  });
});

const connection = {
  user: process.env.POSTGRESQL_USER, 
  database: process.env.POSTGRESQL_DATABASE, 
  password: process.env.POSTGRESQL_PASSWORD, 
  host: 'localhost', 
  port: 5432, 
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
}


const dbConnection = new Pool(connection)


AuthenticationDAO.injectDB(dbConnection)
MessageDAO.injectDB(dbConnection)
ChannelDAO.injectDB(dbConnection)
InviteDAO.injectDB(dbConnection)
EmojiReactionDAO.injectDB(dbConnection)
FriendDao.injectDB(dbConnection)
FriendInviteDao.injectDB(dbConnection)

instrument(io, {auth: false})

export {io}
