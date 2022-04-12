import { Grid, Button, ButtonGroup, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AlignRight } from "../ChatRoom/Modals/ModalStyle"
//HELPERS
import { useUser } from '../../UserContext';
import { useState, useEffect } from 'react';
//COMPONENTS
import ChangePasswordModal from '../ChatRoom/Modals/ChangePasswordModal';
//TYPES
import { SxProps } from '@mui/system';
import TableInvites from './Table';
import ListFriendInvites from './ListInvites';


const ProfileStyle: SxProps = {
    margin: "auto",
    marginTop: "4.5rem",
}

const BoxStyle: SxProps = {
    backgroundColor: "var(--background-color2)",
    marginTop: "1rem",
    padding: "1rem",
    minWidth: "40rem",
    justifyContent: "center",
    alignItems: "center",
    ' > *': {
        marginTop: "0.5rem"
    }
}

const AccordionStyle: SxProps = {
    marginTop: "2rem",
    backgroundColor: "var(--background-color2)",
    color: "var(--text-color)"
}

const Profile = (): JSX.Element => {
    const[isModalOpen, setIsModalOpen] = useState(false)
    const[expandedPanel, setExpandedPanel] = useState<null|number>(null)
    const[dateFormatted, setDateFormatted] = useState<string>("")
    const user = useUser()
    

    

    useEffect(() => {
        if(!user.userInfo?.join_date) return

        let date = new Date(user.userInfo?.join_date)
        const month = date.getUTCMonth() + 1; //months from 1-12
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();

        const newDate = year + "/" + month + "/" + day;
        setDateFormatted(newDate)

    }, [user.userInfo?.join_date]);
    

    const handlePanelChange = (panelNumber: number): void => {
        expandedPanel===panelNumber? setExpandedPanel(null) :setExpandedPanel(panelNumber)
    }

    return(
        <Grid sx={ProfileStyle}>
            {user.userInfo?
                <Grid sx={BoxStyle}> 
                    <h2>My Account :</h2>
                    <div>Username: {user.userInfo.username}</div>
                    <div>Id: {user.userInfo.id}</div>
                    <div>Account created at: {dateFormatted}</div>
                    <Grid sx={AlignRight}>
                        <ButtonGroup variant="contained" aria-label="outlined primary button group" >
                            <Button onClick={()=>setIsModalOpen(true)}>Change password</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
                :null
            }
            
                <Accordion sx={AccordionStyle} expanded={expandedPanel === 1} onChange={()=>handlePanelChange(1)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{ width: '60%', flexShrink: 0 }}>
                            Your invites to other users:
                        </Typography>
                    </AccordionSummary>
                    
                    <AccordionDetails>
                        <TableInvites></TableInvites>
                    </AccordionDetails>
                </Accordion>
           
                <Accordion sx={AccordionStyle} expanded={expandedPanel === 2} onChange={()=>handlePanelChange(2)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                  
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{ width: '60%', flexShrink: 0 }}>
                            Your friend requests:
                        </Typography>
                    </AccordionSummary>
                    
                    <AccordionDetails>
                        <ListFriendInvites></ListFriendInvites>
                    </AccordionDetails>
                </Accordion>
            
            <ChangePasswordModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen}></ChangePasswordModal>
        </Grid>
    )
}

export default Profile;