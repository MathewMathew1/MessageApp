
//LIBRARIES
import {  Grid } from '@mui/material'
import { useEffect, useState, createContext, useContext } from "react"
//HELPERS
import useArray from '../../customHooks/useArray'
import { useUser, useUserUpdate } from '../../UserContext'
import { urlOfChannelData } from "../../apiRoutes"
//COMPONENTS
import MessageBox from './MessageBox'
import ChatRoomUserList from "./ChatRoomUserList"
//TYPES
import { UserInChannel, ChannelInfo } from '../../types/types'
import { SxProps } from '@mui/system'

const ChatRoomStyle: SxProps = {
    display: "flex",
    margin: "auto",
    justifyContent: "center",
    marginTop: "4.5rem",
}

type ChannelContextProps = {   
    userList: UserInChannel[] 
    channelId: string|null,
    controller: AbortController,
    userChannelInfo: UserInChannel|undefined,
    channelInfo: ChannelInfo| undefined
}

const ChannelContext = createContext({} as ChannelContextProps)


export function useChannel(){
    return useContext(ChannelContext)
}

let controller = new AbortController()
const ChatRoom = (props: any): JSX.Element => {   
    const userInChannelList = useArray<UserInChannel>([])
    const [channelInfo, setChannelInfo] = useState<ChannelInfo>()
    const [channelId, setChannelId] = useState<string|null>(null)
    const [userChannelInfo, setUserChannelInfo] = useState<UserInChannel|undefined>()
    const user = useUser()
    const userUpdate = useUserUpdate()
    controller = new AbortController()
    
    const changeUrl = () => {
        let userIsInDifferentChannel = false
        for(let i=0; i<user.userChannels.length; i++){
            let redirectUrl: string
            const differentChannelThanCurrent = user.userChannels[i].channel_id.toString() !== channelId
            
            if(differentChannelThanCurrent){
                userIsInDifferentChannel = true
                redirectUrl = "/channel?channelId="+user.userChannels[i].id  
                props.history.push(redirectUrl)
                break
            }
        }
        if(!userIsInDifferentChannel) window.history.replaceState(null, "Oliphant", "/")
    }

    useEffect(() => {
        if(user.socket === undefined) return
        user.socket.on('user-joined-channel', ({channelUser}: {channelUser: UserInChannel}) => {
            userInChannelList.push(channelUser)
        })
        user.socket.on("user-left-channel", ({userId}: {userId: number}) => {
            userInChannelList.removeByKey("id", userId.toString())
            
            if(user.socket !== undefined) user.socket.emit("leave-chatroom", channelId)
            
            if(userId.toString() === user.userInfo?.id){
                changeUrl()
            }
        })
        user.socket.on('channel_and_room_deleted', () => {
            if(channelId!==null) userUpdate.removeChannel(parseInt(channelId))
            changeUrl()
        })
        user.socket.on('user-removed', ({userId}:{userId: number}) => {
            userInChannelList.removeByKey("id", userId.toString())
            if(userId.toString() === user.userInfo?.id){
                if(channelId!==null) userUpdate.removeChannel(parseInt(channelId))
                changeUrl()
            }
        })

        return () => {
            if(user.socket !== undefined) {
                user.socket.off('user-joined-channel')
                user.socket.off('user-left-channel')
                user.socket.off('channel_and_room_deleted')
                user.socket.off('user-removed')
            }
         }
    }, [user.socket, userInChannelList, user.userInfo, user.userChannels, channelId]);

    const parseParams = (params = "") => {
        const rawParams = params.replace("?", "").split("&")
        const extractedParams: {[key: string]: string} = {}
        rawParams.forEach((item) => {
          let modifiedItem: string[] = item.split("=")
          extractedParams[modifiedItem[0]] = modifiedItem[1]
        });
        return extractedParams;
    }

    useEffect(() => {
        if(user.socket!==undefined) user.socket.emit("join-chatroom", channelId)

    }, [user.socket, channelId]);

    useEffect(() => {
        let filter: {[key: string]: string} = parseParams(props.location.search)
        let id: string =  filter["channelId"] as string || "1"

        const didUserLeftRoom = channelId!==null && id!==channelId
        if(didUserLeftRoom && user.socket!==undefined ) user.socket.emit("leave-chatroom", channelId)

        userUpdate.setCurrentlyObservedChannel(id)
        
        setChannelId(id)
        
        if(id===undefined) return
        const { signal } = controller
        fetch(urlOfChannelData+id,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {                     
                if("error" in response) {
                    let redirectUrl = user.userChannels[0] !== undefined ? "/channel?channelId="+user.userChannels[0].id : "/"
                    props.history.push(redirectUrl)
                    return
                }
                userInChannelList.set(response.channelMembers)
                setChannelInfo(response.channelInfo[0])
               
            })
            .catch(error=>{console.log(error)})

         
    }, [props.location.search]);
    
    useEffect(() => {
        if(userInChannelList.array.length!==0)
            setUserChannelInfo(userInChannelList.array.find((userM:UserInChannel)=>userM.id===user.userInfo?.id))
    }, [user.userInfo?.id, userInChannelList.array, setUserChannelInfo])

    useEffect(() => {
        return () => {
            controller.abort()
            userUpdate.setCurrentlyObservedChannel(null)
        }
    }, [])



    return (
        <Grid sx={ChatRoomStyle} container>
            <ChannelContext.Provider value={{channelId, controller, userChannelInfo, channelInfo, userList: userInChannelList.array}} >
                <Grid item xs={10}>
                    <MessageBox></MessageBox>
                </Grid>
                <Grid item xs={2}>
                    <ChatRoomUserList></ChatRoomUserList>
                </Grid>
            </ChannelContext.Provider>
        </Grid>
    );
}

export default ChatRoom;