import {Modal, Box, ButtonGroup, Button, Grid, TextField, Typography,} from "@mui/material";
import { ModalStyle, AlignRight } from "./ModalStyle";
//HELPERS;
//TYPES
import { useEffect, useState } from "react";
import { SxProps } from "@mui/system"

const titleWarningStyle: SxProps = {
    backgroundColor: "red",
    padding: "0.5rem"
}

const inputStyle: SxProps = {
    backgroundColor: "var(--background-color2) !important",
    marginTop: "1rem",
    marginBottom: "0.5rem",
    '> *': {
       
        color: "var(--text-color) !important",
    }
}

const ConfirmModal = ({isModalOpen, setIsModalOpen, modalTitle, deleteButtonText, onDeleteFunction, valueToCheck, textFieldLabel }: {
    isModalOpen: boolean, 
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>, 
    idOfDeletedThing: string|undefined,
    modalTitle: string,
    deleteButtonText: string,
    onDeleteFunction: Function,
    valueToCheck: string,
    textFieldLabel: string
}): JSX.Element => {
    
    const[inputValue, setInputValue] = useState("")
    const[error, setError] = useState<string|null>(null)

    const deleteSomething = () => {
        if(valueToCheck===inputValue) {
            onDeleteFunction()
            return
        }
        setError("Bad value")
    }

    useEffect(() => {
        setInputValue("")
    }, [isModalOpen]);

    return(
        <Modal
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            aria-labelledby="modal-modal-deleting"
            aria-describedby="confirm deleting"
        >
            <Box sx={ModalStyle} >
                <Typography sx={titleWarningStyle} variant="h6" gutterBottom component="div">
                    {modalTitle}
                </Typography>
               
                    <Grid>
                        Type {valueToCheck}
                    </Grid>
                    <TextField autoComplete={"false"} sx={inputStyle} value={inputValue} onChange={(e)=> setInputValue(e.target.value)} 
                        id="outlined-basic" label={textFieldLabel} variant="outlined" error = {error !== null}
                        helperText={error}/>

                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={()=>setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={()=>deleteSomething()} color="error">{deleteButtonText}</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default ConfirmModal