import {Modal, Box, ButtonGroup, Button, Grid} from "@mui/material";
import { ModalStyle, AlignRight } from "./ModalStyle";
//HELPERS
import { urlOfDeleteMessage } from "../../../apiRoutes";
//TYPES
import { deleteModalInfo } from "../MessageBox";
import { useEffect } from "react";

const DeleteMessageModal = ({isModalOpen, setIsModalOpen, idOfDeletedMessage, controller }: {isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<deleteModalInfo>>, 
    idOfDeletedMessage: string|undefined, controller: AbortController}): JSX.Element => {

    const deleteMessage = (): void => {
        if(idOfDeletedMessage===undefined) return
        const { signal } = controller

  
        fetch(urlOfDeleteMessage+idOfDeletedMessage,{
            method: "Delete",
            signal,
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                setIsModalOpen({isModalOpen: false})
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
            onClose={()=>setIsModalOpen({isModalOpen: false})}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ModalStyle} >
                
                Are you sure you want to delete this message?
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={()=>setIsModalOpen({isModalOpen: false})}>Cancel</Button>
                        <Button onClick={()=>deleteMessage()} color="error">Delete</Button>
                        
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default DeleteMessageModal