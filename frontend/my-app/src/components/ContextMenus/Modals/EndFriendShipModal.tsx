import {Modal, Box, ButtonGroup, Button, Grid,} from "@mui/material"
import { ModalStyle, AlignRight } from "../../ChatRoom/Modals/ModalStyle" 

const EndFriendShipModal = ({isModalOpen, setIsModalOpen, callBackFunction, friendName}: {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    callBackFunction: Function,
    friendName: string, 
}): JSX.Element => {

    return(
        <Modal        
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            aria-labelledby="change password modal"
            aria-describedby="change password modal"
        >
            <Box sx={ModalStyle} >
                Are you sure you want to remove {friendName} from friends
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={()=>setIsModalOpen(false)} color="error">Cancel</Button>
                        <Button onClick={()=>callBackFunction()}>Remove</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default EndFriendShipModal 