import  {useState, createContext, useContext, useEffect} from "react";
import { UserInfo, UserInvites, UserChannel, FriendInvites, Friendship, FriendshipWithOutlookFromUser } from "./types/types";
import { urlOfUserData, urlOfUserInvites, urlOfUserChannels, urlOfSocketConnection, urlOfFriendInvitesReceived, urlOfListOfFriends } from "./apiRoutes";
import { io, Socket } from "socket.io-client"
import useArray from "./customHooks/useArray";
import { useUpdateSnackbar } from "./SnackBarContext";



type UserContextProps = {    
    logged: boolean; 
    fetchingUserDataFinished: boolean;
    userInfo: UserInfo|undefined;
    userInvites: UserInvites[];
    userChannels: UserChannel[];  
    currentlyObservedChannel: null|string;
    socket: Socket|undefined;
    userFriendInvites: FriendInvites[];
    userFriends: FriendshipWithOutlookFromUser[]
}

type UserUpdateContextProps = {  
    setCurrentlyObservedChannel: React.Dispatch<React.SetStateAction<string | null>>
    removeInvite: (idOfInvite: string) => void
    logout: () => void
    removeFriendInvite: (idOfInvite: string) => void
    addChannel: (newChannel: UserChannel) => void
    removeChannel: (channelId: number) => void
}    

const UserContext = createContext({} as UserContextProps)
const UserUpdate = createContext({} as UserUpdateContextProps)


export function useUser(){
    return useContext(UserContext)
}

export function useUserUpdate(){
    return useContext(UserUpdate)
}

const UserProvider = ({ children }: {children: React.ReactNode}): JSX.Element => {
    const[logged, setLogged] = useState(false)
    const[userInfo, setUserInfo] = useState<UserInfo>()
    const userInvites = useArray<UserInvites>([])
    const userFriendInvites = useArray<FriendInvites>([])
    const userFriends = useArray<FriendshipWithOutlookFromUser>([])
    const userChannels = useArray<UserChannel>([])
    const[fetchingUserDataFinished, setFetchingUserDataFinished] = useState(false)
    const[currentlyObservedChannel, setCurrentlyObservedChannel] = useState<null|string>(null)
    const [socket, setSocket] = useState<Socket>()
    const controller = new AbortController()

    const updateSnackbar = useUpdateSnackbar()

    useEffect(() => {
        
        if(socket === undefined) return
       
        socket.on('send-invite', (invite: UserInvites) => {
            userInvites.push(invite)
            updateSnackbar.addSnackBar({snackbarText: `User ${invite.username} invited you to channel ${invite.channel_name}.`, severity: "info"})
        })
        socket.on('deleted-invite', (inviteId: number) => {
            let inviteIndex = userInvites.findIndexByKey("id", inviteId.toString())

            if(inviteIndex===-1) return
            
            let invite = userInvites.array[inviteIndex]
            updateSnackbar.addSnackBar({snackbarText: `User ${invite.username} removed invite to ${invite.channel_name}.`, severity: "info"})
            userInvites.removeValueByIndex(inviteIndex)
        })
        socket.on('send-friend-invite', (invite: FriendInvites) => {
            userFriendInvites.push(invite)
            updateSnackbar.addSnackBar({snackbarText: `User ${invite.username} send you friend request.`, severity: "info"})
        })
        socket.on('deleted-friend-invite', (inviteId: number) => {
            let inviteIndex = userFriendInvites.findIndexByKey("id", inviteId.toString())
            if(inviteIndex===-1) return

            let invite = userFriendInvites.array[inviteIndex]
            updateSnackbar.addSnackBar({snackbarText: `User ${invite.username} removed friend request.`, severity: "info"})
            userFriendInvites.removeValueByIndex(inviteIndex)
        })
        socket.on('friend-status-changed', ({userId, isOnline}: {userId: number, isOnline: boolean}) => {
            userFriends.updateObjectByKey("user_one_id", userId.toString(), [
                {field: "isOnline", fieldValue: isOnline},
            ])
            userFriends.updateObjectByKey("user_two_id", userId.toString(), [
                {field: "isOnline", fieldValue: isOnline},
            ])
        })
        socket.on("friendship_ended", ({userEndingFriendshipId, friendId}: {userEndingFriendshipId: number, friendId: number}) =>{
            let userId = userEndingFriendshipId.toString()!==userInfo?.id? userEndingFriendshipId.toString(): friendId.toString()
            userFriends.removeByKey("user_one_id", userId)
            userFriends.removeByKey("user_two_id", userId)
        })
        socket.on('channel_deleted', ({channelId}: {channelId: number}) => {
            let index = userChannels.findIndexByKey("channel_id", channelId)

            if(index!==-1){
                let channel = userChannels.array[index]
                userChannels.removeValueByIndex(index)
                updateSnackbar.addSnackBar({snackbarText: `Channel ${channel.name} was deleted.`, severity: "warning"})
            }
        })
        socket.on('new_friend', (friendship: Friendship) => {

            let convertedFriendShip: FriendshipWithOutlookFromUser = {
                start_of_friendship: friendship.start_of_friendship,
                user_one_id: friendship.user_one_id,
                user_two_id: friendship.user_two_id,
                username: friendship.user_one_id!==userInfo?.id? friendship.username_one: friendship.username_two,
                isOnline: friendship.user_one_id!==userInfo?.id? friendship.is_user_one_online: friendship.is_user_two_online,
            }
            userFriends.push(convertedFriendShip)
        })
       
        socket.on("connect", () => {
        })
        socket.on('disconnect', () => {
            socket.removeAllListeners();
        })
        
        return () => {
           socket.off('send-invite')
           socket.off('deleted-invite')
           socket.off('new_friend')
           socket.off('friendship_ended')
           socket.off('send-friend-invite')
           socket.off('deleted-friend-invite')
           socket.off('friend-status-changed')
           socket.off('channel_deleted')
           socket.off('disconnect')
           socket.off('connect')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userFriends, userFriendInvites, userInvites])
   

    const fetchAllData = async (): Promise<void> => {
        if(!localStorage.getItem("token")) {
            setFetchingUserDataFinished(true)
            return
        }
        
        const { signal } = controller
        await fetch(urlOfUserData,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)){
                    setLogged(true)
                    setUserInfo(response.userData)
                    Promise.allSettled([
                        fetchUserInvites(),
                        fetchUserChannels(),
                        fetchFriendInvites(),
                        fetchUserFriendShips()
                    ]).then(()=>setFetchingUserDataFinished(true))                 
                }
            })
            .catch(error=>{console.log(error)})    
        
        setFetchingUserDataFinished(true)
    }

    const fetchUserInvites = (): void => {
        if(!localStorage.getItem("token")) return
        
        const { signal } = controller
        fetch(urlOfUserInvites,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})

        .then(response => response.json())
        .then(response => {
            if(!("error" in response)){
                userInvites.set(response.invites)
            }
        })
        .catch(error=>{console.log(error)})    
        
 
    }

    const fetchFriendInvites = (): void => {
        if(!localStorage.getItem("token")) return
        
        const { signal } = controller
        fetch(urlOfFriendInvitesReceived,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})

        .then(response => response.json())
        .then(response => {
            if(!("error" in response) && Array.isArray(response.invites)){
                userFriendInvites.set(response.invites)
            }
        })
        .catch(error=>{console.log(error)})    
        

    }

    const fetchUserFriendShips= (): void => {
        if(!localStorage.getItem("token")) return
        
        const { signal } = controller
        fetch(urlOfListOfFriends,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})

        .then(response => response.json())
        .then(response => {
            if(!("error" in response) && Array.isArray(response.friendships)){
                userFriends.set(response.friendships)
            }
        })
        .catch(error=>{console.log(error)})    

    }

    const fetchUserChannels = (): void => {
        if(!localStorage.getItem("token")) return
        const { signal } = controller
        fetch(urlOfUserChannels,{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})

        .then(response => response.json())
        .then(response => {
            if(!("error" in response) && Array.isArray(response.userChannels)){
                userChannels.set(response.userChannels)
                return
            }
        })
        .catch(error=>{console.log(error)})    

    }

    useEffect(() => {

        setSocket(io(urlOfSocketConnection, {
            query: {token: "Bearer " + localStorage.getItem("token")}
        }))
        fetchAllData()

        return () => {
            if(socket !==undefined) socket.disconnect()
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeInvite = (idOfInvite: string): void => {
        userInvites.removeByKey("id", idOfInvite)
    }

    const addChannel = (newChannel: UserChannel) => {
        userChannels.push(newChannel)
    }

    const removeChannel = (channelId: number) => {
        userChannels.removeByKey("channel_id", channelId)
    }

    const removeFriendInvite = (idOfInvite: string): void => {
        userFriendInvites.removeByKey("id", idOfInvite)
    }

    const logout = (): void => {
        setLogged(false)
        localStorage.removeItem("token")
        setUserInfo(undefined)
        userInvites.set([])
        userChannels.set([])
        setFetchingUserDataFinished(true)
        setCurrentlyObservedChannel(null)
        setSocket(undefined)
        const snackBarInfo = {message: "Logout successfully", severity: "success"}
        sessionStorage.setItem("snackbar", JSON.stringify(snackBarInfo))
        window.location.replace("/")
    }

    return (
        <UserContext.Provider value={{logged, fetchingUserDataFinished, userInfo, userInvites: userInvites.array, 
            userChannels: userChannels.array, currentlyObservedChannel, socket, userFriendInvites: userFriendInvites.array, userFriends: userFriends.array}}>
            <UserUpdate.Provider value={{setCurrentlyObservedChannel, removeInvite, logout, removeFriendInvite, addChannel, removeChannel}}>
                {children}   
            </UserUpdate.Provider>
        </UserContext.Provider>
    )
}

export default UserProvider