import {List, ListItem, ListItemText, Grid, Typography, Box, Tooltip, TextField, Alert, IconButton, Autocomplete } from "@mui/material";
import { MenuPosition, UserInChannel} from "../../types/types"
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
//COMPONENTS
import AvatarComponent from '../User/Avatar';
import UserPrivilegesModal from "./Modals/UserPrivilegesModal";
import UserContextMenu from "../ContextMenus/UserContextMenu";
//HELPERS
import { useChannel } from "./ChatRoom";
import { useEffect, useState } from "react";
import { urlOfSendInvite } from "../../apiRoutes";
import { useUser } from "../../UserContext";
import { validateNumberInInput } from "../../helper";
import { useUpdateSnackbar } from "../../SnackBarContext";
//TYPES
import { SxProps } from "@mui/system";
import { UserInContextMenu } from "../../types/types";

const UsernameDisplay: SxProps = {
  flex: "none",
  marginLeft: "1rem",
}

const UserListHeader: SxProps = {
  mt: 4, 
  mb: 2, 
  display: "flex", 
  justifyContent: "center",
}

const BoxStyle: SxProps = {
  marginRight: "0.2rem",
}

const UsersBoxStyle: SxProps = {

  position: "relative",
  overflow: "auto",
  maxHeight: "400px"
}

const InviteInput: SxProps = {
  backgroundColor: "var(--background-color2) !important",
  color: "var(--text-color) !important",
  ' > *': {
    color: "var(--text-color) !important",
  }
}

const GridStyle: SxProps = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
}

const ListItemStyle: SxProps = {
  '&:hover': {
    background: "var(--theme-hovered)",
  }
}


const ChatRoomUserList = (): JSX.Element => {
   
  const [invitedId, setInvitedId] = useState("")
  const [contextMenu, setContextMenu] = useState<MenuPosition>(null)
  const [userInContextMenu, setUserInContextMenu] = useState<UserInContextMenu|undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userInfoToModal, setUserInfoToModal] = useState<UserInChannel>()
  const [inviteError, setInviteError] = useState<string|null>(null)
  const [optionsForInviteUser, setOptionsForInvitedUser] = useState<{label: string, username: string}[]>([{label: "1", username: "string"}])
  
  const currentLoggedUser = useUser()
  const updateSnackbar = useUpdateSnackbar()
  
  const channelInfo = useChannel() 
  const user = useUser()

  const handleContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    if(channelInfo.userList[index].id===user.userInfo?.id){
      setUserInContextMenu({
        isFriend: false,
        id: channelInfo.userList[index].id,
        sameUserAsCurrentlyLogged: true,
        username: channelInfo.userList[index].username,
        channelInfoInContext: null
      })
    }
    else{
      setUserInContextMenu({
        isFriend: user.userFriends.some((friend)=>{
          let friendId = friend.user_one_id!==user.userInfo?.id? friend.user_one_id: friend.user_two_id
          return friendId === channelInfo.userList[index].id
        }),
        id: channelInfo.userList[index].id,
        username: channelInfo.userList[index].username,
        channelInfoInContext: channelInfo.channelId!==null?{
          id: channelInfo.channelId,
          canKickUser: channelInfo.userChannelInfo?.is_owner_of_channel!==undefined? channelInfo.userChannelInfo?.is_owner_of_channel: false
        }
        : null
      })
    }
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
 
  useEffect(() => {
      setInviteError(null)
  }, [channelInfo.channelId]);

  useEffect(() => {
    let optionsForAutoComplete = user.userFriends.filter((friend)=>{
        let userId = friend.user_one_id!==user.userInfo?.id? friend.user_one_id: friend.user_two_id
        if(channelInfo.userList.some((user)=>{return user.id===userId})) return false
        return true
      }).map((friend)=>{
      let userId = friend.user_one_id!==user.userInfo?.id? friend.user_one_id: friend.user_two_id
      return(
        {
          label: userId, 
          username: friend.username
        }
      )
    })
    setOptionsForInvitedUser(optionsForAutoComplete)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userFriends.length, channelInfo.channelInfo?.id]);
  
  const sendInvite = (): void => {
    const { signal } = channelInfo.controller
    const body = {
      "userId": invitedId
    }

    fetch(urlOfSendInvite+channelInfo.channelId,{
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
          updateSnackbar.addSnackBar({snackbarText: "Invite sent", severity: "success"})
          setInviteError(null)
          setInvitedId("")
      })
      .catch(error=>{console.log(error)})
  }

  const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    //it triggers by pressing the enter key without shift
    if (e.key=== 'Enter' ) sendInvite()
  }

  useEffect(() => {
    setInvitedId("")
  }, [channelInfo.channelId]);
  
  const canInvite = channelInfo.userChannelInfo?.can_invite || channelInfo.userChannelInfo?.is_owner_of_channel
  return (
    <Box sx={BoxStyle}>
      <Grid container >
        <Grid sx={GridStyle} item xs={12} md={12}>
            <Typography sx={UserListHeader} variant="h6" component="div">
              {channelInfo? <span> Users in {channelInfo.channelInfo?.name}:</span>: null}
            </Typography>
              <List sx={UsersBoxStyle} >
              {channelInfo.userList.map((user: UserInChannel, index: number) => {
                 
    
                    const canCurrentLoggedUserEditPrivilegesThisUser: boolean = channelInfo.userChannelInfo?.is_owner_of_channel === true 
                      && user.id!==currentLoggedUser.userInfo?.id
                    
                    return(
                      <ListItem onContextMenu={(e)=>handleContextMenu(e, index)} sx={ListItemStyle} key={index}>
                        <AvatarComponent name={user.username}></AvatarComponent>
                        <ListItemText sx={UsernameDisplay}primary={user.username}/>
                        {user.is_owner_of_channel? (<Tooltip title="Server owner" placement="top"><StarIcon sx={{ color: "yellow" }}></StarIcon></Tooltip>):null}
                        {canCurrentLoggedUserEditPrivilegesThisUser?
                        
                          <Tooltip title="Edit User privileges" placement="top">
                            <IconButton onClick={()=>{console.log(user); setUserInfoToModal(user); setIsModalOpen(true)}}>
                              <EditIcon  sx={{ color: "grey !important" }}></EditIcon>
                            </IconButton>
                          </Tooltip>
                          :null
                        }
                      </ListItem>
                    )            
                  })}  
              </List>
          </Grid>
        </Grid> 
        { canInvite? 
          <>
          {inviteError!==null? <Alert severity="error">{inviteError}</Alert>: null}
          
            <Autocomplete
              inputValue={invitedId}
              onChange={(_event: any, newValue: {label: string, username: string}|null) => {
                if(newValue!==null) setInvitedId(newValue.label);
              }}
              id="country-select-demo"
              options={optionsForInviteUser}
            
              getOptionLabel={(option) => option.label}
              renderOption={(props: any, option) => {
                return(
                  <Grid {...props}  key={`autocomplete ${option.label}`}>
                    <AvatarComponent name={option.username}></AvatarComponent>
                    <Grid sx={{marginLeft: "0.5rem"}}>
                      {option.username}
                    </Grid>
                  </Grid>
                )}}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onKeyDown={(e)=>handleKeypress(e)}
                  onKeyPress={((e)=>validateNumberInInput(e))}
                  spellCheck="false" 
                  placeholder="Invite user by id"
                  sx={InviteInput}/>
              )}
            />
          </>
          :<></>
        }
        { userInfoToModal!==undefined?
          <UserPrivilegesModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userInfo={userInfoToModal}></UserPrivilegesModal>
          :null
        }
        {userInContextMenu!==undefined?
          <UserContextMenu user={userInContextMenu} contextMenu={contextMenu} handleClose={setContextMenu}/>
          :
          null
        }
      </Box>
      
  );
}

export default ChatRoomUserList;