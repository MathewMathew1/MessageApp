import { Modal, Box, List, ListItem, Checkbox, ListItemIcon, ButtonGroup, Button, Grid, Alert } from "@mui/material"
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
//HELPERS
import { useEffect, useState } from "react"
import { ModalStyle, AlignRight } from "./ModalStyle"
import { ulrOfChangingUserPrivileges, urlOfRemovingUser } from "../../../apiRoutes"
import { useChannel } from "../ChatRoom"
import { useUpdateSnackbar } from "../../../SnackBarContext"
//COMPONENTS
//TYPES
import { UserInChannel } from "../../../types/types"

const ERRORS = {
    SAME_PRIVILEGES: "New Privileges cannot be same as old one",
}  

const UserPrivilegesModal = ({isModalOpen, setIsModalOpen, userInfo}: {isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,userInfo: UserInChannel}): JSX.Element => {
    const[canInvite, setCanInvite] = useState(userInfo.can_invite)
    const[error, setError] = useState<string|null>(null)
    
    const updateSnackbar = useUpdateSnackbar()
    const channel = useChannel()
    console.log(userInfo)
    const controller = new AbortController()

    const changingUserPrivileges = (): void => {
        if(canInvite===userInfo.can_invite) {
            setError(ERRORS.SAME_PRIVILEGES)
            return
        }
        const { signal } = controller
        const body = {
            userId: userInfo.id,
            canInvite: canInvite
        }

        fetch(ulrOfChangingUserPrivileges+channel.channelId,{
            method: "PATCH",
            body: JSON.stringify(body),
            signal,
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {         
                if(!("error" in response)) {
                    
                    updateSnackbar.addSnackBar({snackbarText: "Privileges changed successfully", severity: "success"})
                    setIsModalOpen(false)
                    setError(null)
                    return
                }
                setError(response.error)
            })
            .catch(error=>{console.log(error)})
    }   

    const kickUser = (): void => {
        const { signal } = controller
        
        fetch(urlOfRemovingUser+channel.channelId+`?userId=${userInfo.id}`,{
            method: "DELETE",
            signal,
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {         
                if(!("error" in response)) {
                    
                    updateSnackbar.addSnackBar({snackbarText: "Kicked user successfully", severity: "success"})
                    setIsModalOpen(false)
                    return
                }
                updateSnackbar.addSnackBar({snackbarText: "Unable to kick user", severity: "error"})
            })
            .catch(error=>{console.log(error)})
    }   
    
    useEffect(() => {
        setError(null)
    }, [isModalOpen]);
    
    return(
        <Modal
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ModalStyle} >
                Edit {userInfo.username} privileges:
                <List>
                    <ListItem>
                        Invite other users
                        <ListItemIcon>
                            <Checkbox
                                edge="end"
                                checked={canInvite}
                                tabIndex={-1}
                                onChange={()=>setCanInvite(!canInvite)}
                                disableRipple
                            />
                        </ListItemIcon>
                    </ListItem>
                   <ListItem>
                        <Button onClick={()=>kickUser()} variant="contained" color="error" endIcon={<PersonRemoveIcon/>}>Kick </Button>
                   </ListItem>
                </List>
                
                {error!==null? <Alert severity="error">{error}</Alert>: null}
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button color="secondary"  onClick={()=>setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={()=>changingUserPrivileges()} >Save</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )

}

export default UserPrivilegesModal