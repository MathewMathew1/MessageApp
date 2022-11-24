import {Modal, Box, ButtonGroup, Button, Grid} from "@mui/material"
import { ModalStyle, AlignRight } from "../../ChatRoom/Modals/ModalStyle" 
//HELPERS

const LeaveChannelModal = ({isModalOpen, setIsModalOpen, callBackFunction, channelName}: {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    callBackFunction: Function,
    channelName: string, 
}): JSX.Element => {

    return(
        <Modal
            
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            aria-labelledby="change password modal"
            aria-describedby="change password modal"
        >
            <Box sx={ModalStyle} >
                Are you sure you want to leave {channelName}
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={()=>setIsModalOpen(false)} color="error">Cancel</Button>
                        <Button onClick={()=>callBackFunction()}>Leave</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default LeaveChannelModal 