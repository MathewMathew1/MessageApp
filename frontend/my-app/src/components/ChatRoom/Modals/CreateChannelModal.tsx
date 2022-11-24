import {Modal, Box, ButtonGroup, Button, Grid, TextField} from "@mui/material";
import { useEffect, useState } from "react";
import { urlOfCreateChannel } from "../../../apiRoutes";
import { ModalStyle, AlignRight } from "./ModalStyle";
import { SxProps } from "@mui/system";
import { useUpdateSnackbar } from "../../../SnackBarContext";
import { useUserUpdate } from "../../../UserContext";

const NameChannelInput: SxProps = {
    marginTop: "0.8rem",
    width: "80%",
    backgroundColor: "var(--background-color2) !important",
    color: "var(--text-color) !important",
    ' > *': {
      color: "var(--text-color) !important",
    }
  }

const MINIMAL_CHANNEL_LENGTH = 3
const TOO_SHORT_NAME = `Name of channel is too short, at least ${MINIMAL_CHANNEL_LENGTH} characters required`

const CreateChannelModal = ({isModalOpen, setIsModalOpen}: {isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element => {
    const [channelName, setChannelName] = useState("")
    
    const updateSnackbar = useUpdateSnackbar()
    const userUpdate = useUserUpdate()
    const controller = new AbortController()
    const [error, setError] = useState<string|null>(null)

    const createChannel = (): void => {
        if(channelName.length < MINIMAL_CHANNEL_LENGTH) {
            setError(TOO_SHORT_NAME)
            return
        }

        setError(null)
        
        const body = {
            "channelName": channelName
        }
        const { signal } = controller

        fetch(urlOfCreateChannel,{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(!response.error){
                    
                    userUpdate.addChannel(response.channel)
                    updateSnackbar.addSnackBar({snackbarText: "Channel created successfully", severity: "success"})
                    setIsModalOpen(false)
                    return
                }
                updateSnackbar.addSnackBar({snackbarText: "Unable to create channel", severity: "error"})
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
        <Modal
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ModalStyle} >
                Channel Name
                <TextField id="outlined-error" error={error!==null} helperText={error} sx={NameChannelInput} placeholder="Lotr Fan Club" value={channelName} onChange={(e)=> setChannelName(e.target.value)}></TextField>
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        
                        <Button onClick={()=>setIsModalOpen(false)} color="error">Cancel</Button>
                        <Button onClick={()=>createChannel()}>Create</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default CreateChannelModal