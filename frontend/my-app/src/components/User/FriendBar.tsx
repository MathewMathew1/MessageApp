import { Alert, Box, Toolbar, List, Divider, ListItem, Tooltip, TextField, Grid, Badge } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'
//HELPERS
import { useUser } from '../../UserContext'
import { useState } from 'react'
import { urlOfSendingFriendInvite } from "../../apiRoutes"
//COMPONENTS
import AvatarComponent from './Avatar'
//TYPES
import { SxProps } from '@mui/system'
import { useUpdateSnackbar } from '../../SnackBarContext'
import { validateNumberInInput } from '../../helper'
import { MenuPosition, UserInContextMenu } from '../../types/types'
import UserContextMenu from '../ContextMenus/UserContextMenu'


const ONLINE_STATUS_COLOR =  {
    true: "green",
    false: "red"
}

const onlineStatusBadgeStyle = (color: string): SxProps => {
    const dottedBadge: SxProps = {
        '& .MuiBadge-badge': {
            height: "12px",
            width: "12px",
            backgroundColor: color,
            borderRadius: "50%",
            display: "inline-block",
        }
    }
    return dottedBadge
}

const DRAWER_HEIGHT = 220;

const InviteInput: SxProps = {
    backgroundColor: "var(--background-color2) !important",
    color: "var(--text-color) !important",
    ' > *': {
      color: "var(--text-color) !important",
    }
}

const BarStyle: SxProps = {
    display: "flex",
    width: DRAWER_HEIGHT,
    flexDirection: "column",
    
    flexShrink: 0,  
    '> *': {
        backgroundColor: "var(--background-color2) !important",
    },
}

const BoxStyle: SxProps = {
    flexGrow : 1,
    overflow: 'auto', 
    paddingLeft: "0.8rem", 
    paddingRight: "0.8rem"
}

const FriendBar = (): JSX.Element => {
    const [friendId, setFriendId] = useState("")
    const [inviteError, setInviteError] = useState<string|null>(null)
    const [contextMenu, setContextMenu] = useState<MenuPosition>(null)
    const[userInContextMenu, setUserInContextMenu] = useState<UserInContextMenu|undefined>()
    
    const controller = new AbortController()

    const updateSnackbar = useUpdateSnackbar()

    const user = useUser()

    const handleContextMenu = (event: React.MouseEvent, index: number) => {
        event.preventDefault();
     
        setUserInContextMenu({
            isFriend: true,
            id: user.userFriends[index].user_one_id!==user.userInfo?.id? user.userFriends[index].user_one_id: user.userFriends[index].user_two_id,
            sameUserAsCurrentlyLogged: false,
            username: user.userFriends[index].username,
            channelInfoInContext: null
        })
        setContextMenu(
            contextMenu === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
            }
            : 
            null,
        );
      }

    const inviteFriend = (): void => {
        const { signal } = controller
        const body = {
            "userId": parseInt(friendId)
        }

        fetch(urlOfSendingFriendInvite,{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if("error" in response){
                    setInviteError(response.error)
                    return
                }
                setInviteError(null)
                updateSnackbar.addSnackBar({snackbarText: "Friend request send", severity: "success"})
                setFriendId("")  
            })
            .catch(error=>{console.log(error)})
    }

    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        //it triggers by pressing the enter key without shift
        if (e.key=== 'Enter' ) inviteFriend()
      }

    if(user.logged){
        return (
            <Grid sx={BarStyle}>
                <Toolbar />
                <Box sx={ BoxStyle }>
                    <Divider />
                    <List>  
                        <>
                            {inviteError!==null? <Alert severity="error">{inviteError}</Alert>: null}
                            <TextField
                                value={friendId}
                                onKeyDown={(e)=>handleKeypress(e)}
                                onChange={(e)=>setFriendId(e.target.value)}
                                spellCheck="false" 
                                autoComplete='off' 
                                onKeyPress={((e)=>validateNumberInInput(e))}
                                placeholder="Invite friend"
                                sx={InviteInput}/>
                        </>
                        <h3>Friend List:</h3>
                        {user.userFriends.map((friend, index) => (
                            <div key={index}>
                                <ListItem onContextMenu={(e)=>handleContextMenu(e, index)} >
                                    <Tooltip  title={friend.username} placement="right" >
                                        <ListItemIcon>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            sx={onlineStatusBadgeStyle(ONLINE_STATUS_COLOR[friend.isOnline.toString()])}
                                            variant="dot"
                                            >
                                                <AvatarComponent name={friend.username}></AvatarComponent> 
                                        </Badge>
                                        </ListItemIcon>
                                    </Tooltip>
                                    {friend.username}
                                </ListItem>
                            </div>
                        ))}
                    </List>
                </Box>
                {userInContextMenu!==undefined?
                    <UserContextMenu user={userInContextMenu} contextMenu={contextMenu} handleClose={setContextMenu}/>
                    :
                    null
                }
            </Grid>
        )
    }
    else{
        return(
            <></>
        )
    }
}

export default FriendBar