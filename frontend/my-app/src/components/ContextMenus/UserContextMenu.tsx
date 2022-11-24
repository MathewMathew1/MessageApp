import { Menu, MenuItem } from "@mui/material"
import { copyToClipboard } from "../../helper"
import { MenuStyle, WarningLabelStyle, SuccessLabelStyle} from "./ContextMenusStyle"
//HELPERS
import { urlOfRemovingUser, urlOfDeleteFriendShip, urlOfSendingFriendInvite } from "../../apiRoutes"
import { useUpdateSnackbar } from "../../SnackBarContext"
import { useEffect, useState } from "react"
//COMPONENTS
import ConfirmModal from "../ChatRoom/Modals/ConfirmModal"
import EndFriendShipModal from "./Modals/EndFriendShipModal"
//types
import { MenuPosition, UserInContextMenu } from "../../types/types"

type closeDispatch = React.Dispatch<React.SetStateAction<MenuPosition>>

const MODAL_OPEN = {
  kick: "kick",
  remove: "remove"
}

const UserContextMenu = ({handleClose, contextMenu, user}: { 
  handleClose: closeDispatch,
  contextMenu: {mouseX: number;mouseY: number} | null,
  user: UserInContextMenu
}): JSX.Element => {
  
  const[modalOpen, setModalOpen] = useState(MODAL_OPEN["kick"])
  const[isModalOpen, setIsModalOpen] = useState(false)
  const updateSnackbar = useUpdateSnackbar()
  const controller = new AbortController()


  const kickUser = () => {
    if(user.channelInfoInContext===null) return
    const { signal } = controller
    fetch(`${urlOfRemovingUser}${user.channelInfoInContext?.id}?userId=${user.id}`,{
        method: "DELETE",
        signal,
        headers: {
            'Content-type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token") || ""
        }})
        .then(response => response.json())
        .then(response => {
            if(!("error" in response)){
              setIsModalOpen(false)
              handleClose(null) 
              updateSnackbar.addSnackBar({snackbarText: "Removed user from channel", severity: "success"})
              return
            }
            updateSnackbar.addSnackBar({snackbarText: response.error, severity: "error"})
        })
        .catch(error=>{console.log(error)})
  }

  const inviteFriend = (id: number): void => {
    const { signal } = controller
    const body = {
        "userId": id
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
          if(!response.error){
            updateSnackbar.addSnackBar({snackbarText: "Friend request send", severity: "success"})
            return
          }
          updateSnackbar.addSnackBar({snackbarText: response.error, severity: "error"})
            
        })
        .catch(error=>{console.log(error)})
  }

  const removeFriend = () => {
    
    const { signal } = controller
    fetch(`${urlOfDeleteFriendShip}${user.id}`,{
        method: "DELETE",
        signal,
        headers: {
            'Content-type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token") || ""
        }})
        .then(response => response.json())
        .then(response => {
          console.log(response)
          if(!("error" in response)){
            setIsModalOpen(false)
            handleClose(null) 
            updateSnackbar.addSnackBar({snackbarText: "FriendShip Ended", severity: "success"})
            return
          }
          updateSnackbar.addSnackBar({snackbarText: response.error, severity: "error"})
        })
        .catch(error=>{console.log(error)})
  }

  useEffect(() => {
    return () => {
        controller.abort()     
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return(
    <>
    <Menu
      onContextMenu={(e)=>{e.preventDefault(); handleClose(null)}}
      open={contextMenu !== null}
      onClose={()=>handleClose(null)}
      anchorReference="anchorPosition"
      sx={MenuStyle}
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={()=>{copyToClipboard(user.id); handleClose(null) }}>Copy Id</MenuItem>
      {user.isFriend? 
        <MenuItem onClick={()=>{setIsModalOpen(true); setModalOpen(MODAL_OPEN["remove"])}} sx={WarningLabelStyle}>Remove friend</MenuItem>
        :
        <div>
          {user.sameUserAsCurrentlyLogged?  
            null
            :
            <MenuItem onClick={()=>inviteFriend(parseInt(user.id))} sx={SuccessLabelStyle}>Friend Invite</MenuItem>
          }
        </div>
      }
      {user.channelInfoInContext?.canKickUser?
        <MenuItem onClick={()=>{setIsModalOpen(true); setModalOpen(MODAL_OPEN["kick"])}} sx={WarningLabelStyle}>Kick</MenuItem>
        :null
      }
    </Menu>
    {modalOpen===MODAL_OPEN["kick"]?
      <ConfirmModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        idOfDeletedThing={user.id}
        modalTitle={`Are you sure you want to kick ${user.username} from channel?`}
        deleteButtonText={"Kick"}
        onDeleteFunction={kickUser}
        valueToCheck={user.username}
        textFieldLabel={"kicked user"}/>
        :
      <EndFriendShipModal 
        friendName={user.username} 
        setIsModalOpen={setIsModalOpen} 
        isModalOpen={isModalOpen}
        callBackFunction={removeFriend}
      /> 
    }
    </>
  )
}

export default UserContextMenu