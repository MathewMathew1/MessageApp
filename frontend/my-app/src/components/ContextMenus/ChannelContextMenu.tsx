import { Menu, MenuItem } from "@mui/material"
//HELPERS
import { copyToClipboard } from "../../helper"
import { MenuStyle, WarningLabelStyle} from "./ContextMenusStyle"
import { urlOfDeletingChannel, urlOfLeavingChannel } from "../../apiRoutes"
import { useUpdateSnackbar } from "../../SnackBarContext"
import { useEffect, useState } from "react"
import { useUserUpdate } from "../../UserContext"
//COMPONENTS
import ConfirmModal from "../ChatRoom/Modals/ConfirmModal"
import LeaveChannelModal from "./Modals/LeaveChannelModal"
//TYPES
import { UserChannel, MenuPosition } from "../../types/types"

type closeDispatch = React.Dispatch<React.SetStateAction<MenuPosition>>

const MODAL_OPEN = {
  leave: "leave",
  delete: "delete"
}

const ChannelContextMenu = ({handleClose, contextMenu, userChannel}: { 
  handleClose: closeDispatch,
  contextMenu: {mouseX: number;mouseY: number} | null,
  userChannel: UserChannel
}): JSX.Element => {
  const[modalOpen, setModalOpen] = useState(MODAL_OPEN["delete"])
  const[isModalOpen, setIsModalOpen] = useState(false)

  const updateSnackbar = useUpdateSnackbar()
  const controller = new AbortController()
  const userUpdate = useUserUpdate()

  const leaveChannel = () => {
    const { signal } = controller
    
    fetch(`${urlOfLeavingChannel}${userChannel.channel_id}`,{
        method: "DELETE",
        signal,
        headers: {
            'Content-type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token") || ""
        }})
        .then(response => response.json())
        .then(response => {
          if(!("error" in response)){
            handleClose(null) 
            setIsModalOpen(false)
            updateSnackbar.addSnackBar({snackbarText: "Left channel successfully", severity: "success"})
            userUpdate.removeChannel(userChannel.channel_id)
            return
          }
          updateSnackbar.addSnackBar({snackbarText: response.error, severity: "error"})
        })
        .catch(error=>{console.log(error)})
  }

  const deleteChannel = () => {
    const { signal } = controller
    console.log(userChannel)

    fetch(`${urlOfDeletingChannel}${userChannel.channel_id}`,{
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
              updateSnackbar.addSnackBar({snackbarText: "Deleted channel successfully", severity: "success"})
              userUpdate.removeChannel(userChannel.channel_id)
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
      <MenuItem onClick={()=>{
        copyToClipboard(userChannel.channel_id.toString())
        handleClose(null) 
      }}>Copy Id</MenuItem>
      <MenuItem onClick={()=>{setIsModalOpen(true); setModalOpen(MODAL_OPEN["leave"])}} sx={WarningLabelStyle} >Leave Server</MenuItem>
      {userChannel.is_owner_of_channel?
        <MenuItem onClick={()=>{setIsModalOpen(true); setModalOpen(MODAL_OPEN["delete"])}} sx={WarningLabelStyle}>Delete Server</MenuItem>
        :null
      }
             

    </Menu>
    {modalOpen===MODAL_OPEN["delete"]?
      <ConfirmModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        idOfDeletedThing={userChannel.id}
        modalTitle={`Are you sure you want to delete ${userChannel.name}?`}
        deleteButtonText={"Delete"}
        onDeleteFunction={deleteChannel}
        valueToCheck={userChannel.name}
        textFieldLabel={"deleted channel"}/>
      :
      <LeaveChannelModal 
        channelName={userChannel.name} 
        setIsModalOpen={setIsModalOpen} 
        isModalOpen={isModalOpen}
        callBackFunction={leaveChannel}
      /> 
    }
    </>
  )
}

export default ChannelContextMenu