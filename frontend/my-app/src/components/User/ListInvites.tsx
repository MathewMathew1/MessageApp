import { IconButton, ListItem, ListItemText, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
//HELPERS
import { FriendInvites } from '../../types/types';
import { useUser } from '../../UserContext';
import useArray from '../../customHooks/useArray';
import { useEffect } from 'react';
import { useUpdateSnackbar } from '../../SnackBarContext';
import { urlOfFriendInvitesSend,  urlOfRespondingToFriendInvite } from '../../apiRoutes';
import { displayDates } from '../../helper';
//types
import { SxProps } from '@mui/system';


const TableStyle: SxProps = {
    backgroundColor: "var(--background-color2)",
    padding: "1rem",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "0rem",
    ' > *': {
        color: "var(--text-color) !important",
        marginTop: "0.5rem"
    }
}


const tableListItemStyle: SxProps = {
    ' > *': {
        color: "var(--text-color) !important",
    }
}

const listItemStyle: SxProps = {
    borderStyle: "solid",
    borderWidth: "0.2rem",
    padding: "0.2rem",
    marginBottom: "0.4rem"
}

const ListFriendInvites = (): JSX.Element => {
    const invites = useArray<FriendInvites>([])
    const updateSnackbar = useUpdateSnackbar()
    const controller = new AbortController()

    const deleteInvite = (id: string): void => {
        const { signal } = controller
        fetch(urlOfRespondingToFriendInvite+id,{
            method: "Delete",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
        .then(response => response.json())
        .then(response => {
            if(!response.error){
                invites.removeByKey("id", id)
                updateSnackbar.addSnackBar({snackbarText: "Friend request deleted", severity: "success"})
                return
            }
            updateSnackbar.addSnackBar({snackbarText: "Unable to delete friend request", severity: "error"})
            console.log(response)
        })
        .catch(error=>{console.log(error)})
    }

    useEffect(() => {
        const fetchUserInvites = (): void => {
            if(!localStorage.getItem("token")) return
            
            const { signal } = controller
            fetch(urlOfFriendInvitesSend,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + localStorage.getItem("token") || ""
                }})
    
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)){
                    invites.set(response.invites)
                }
            })
            .catch(error=>{console.log(error)})    
        }

        fetchUserInvites()

        return () => {
            controller.abort()
        }
    }, []);

    return (
        <>
            {invites.array.length >0 ?
                <>
                    {invites.array.map((value, index) => {
                        return(
                            <ListItem sx={listItemStyle} key={`friend invite ${index}`} disablePadding>
                                <ListItemText  primary={`Send friend request to ${value.username} at 
                                    ${displayDates(value.invite_date)}`} />
                                <Tooltip title="Delete">
                                    <IconButton onClick={()=> deleteInvite(value.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        )
                    })}
                </>
                :<div>No friends request so far</div>
            }
        </>
    )
}

export default ListFriendInvites