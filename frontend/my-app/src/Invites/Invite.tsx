import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
//HELPERS
import { useEffect, useState } from 'react';
import { urlOfMarkingInviteAsSeen, urlOfRespondingToInvite } from '../apiRoutes';
import { useUserUpdate } from '../UserContext';
//TYPES
import { UserInvites } from "../types/types"
import { SxProps } from '@mui/system';
import { useUpdateSnackbar } from '../SnackBarContext';

const itemStyle: SxProps = {
    flexDirection: "column",
    display: "flex",
    width: 400,
    flex: 1,
    flexGrow : 1,
    whiteSpace: "normal",
};

const Invite = ({invite, keyId}: {invite: UserInvites, keyId: number}): JSX.Element => {
    const [wasAlreadyVisible, setWasAlreadyVisible] = useState(false)
    
    const updateSnackbar = useUpdateSnackbar()
    const userUpdate = useUserUpdate()
    
    const controller = new AbortController()

    useEffect(() => {
        let observer = new IntersectionObserver(function(entries) {
        
            if(entries[0].isIntersecting === true)
                markingInviteAsSeenByUser()
        }, { threshold: [1] });
        
        if(!invite.seen_by_user_invited){
            let element = document.getElementById(`id${keyId}`)
            if (element!==null)    {
                observer.observe(element)
            }
        }

        const markingInviteAsSeenByUser = () => {

            if(wasAlreadyVisible) return
            
            setWasAlreadyVisible(true)
            const { signal } = controller
            fetch(urlOfMarkingInviteAsSeen+invite.id,{
                method: "PATCH",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + localStorage.getItem("token") || ""
                }})
            .then(response => { response.json()})
            .then(response => {
                console.log(response)
            })
            .catch(error=>{console.log(error)})
        }

        return () => {
            controller.abort()
        }    
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const respondToInvite = (method: string): void => {
        const { signal } = controller
        fetch(urlOfRespondingToInvite+invite.id,{
            method: method,
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
        .then(response => response.json())
        .then(response => {
            console.log(response)
            if("error" in response){
                updateSnackbar.addSnackBar({severity: "warning", snackbarText: response.error})
                return
            }
            
            userUpdate.addChannel(response.channel)
            updateSnackbar.addSnackBar({severity: "success", snackbarText: "Invite accepted"})
            userUpdate.removeInvite(invite.id)
        })
        .catch(error=>{console.log(error)})
    }
    
    return(
        <MenuItem id={`id${keyId}`} sx={itemStyle}>
            <div> {!invite.seen_by_user_invited? <Chip label="New" color="primary" />: null} 
                You have been invited to {invite.channel_name} by {invite.username}
            </div>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                
                <Button onClick={() => respondToInvite("PATCH")} color="success">Accept</Button>
                <Button onClick={() => respondToInvite("DELETE")} color="error">Decline</Button>
            </ButtonGroup>
        </MenuItem>
    )
}

export default Invite