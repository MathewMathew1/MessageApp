import {Modal, Box, ButtonGroup, Button, Grid, TextField} from "@mui/material"
import { ModalStyle, AlignRight } from "./ModalStyle"
//HELPERS
import { useEffect, useState } from "react"
import { urlOfChangePassword } from "../../../apiRoutes"
import { authorizationErrors, authorizationStandard } from "../../Login/Authorization"
import { SxProps } from "@mui/system"
import { useUpdateSnackbar } from "../../../SnackBarContext"


type passwordErrorType = {
    oldPasswordError: string, 
    newPasswordError: string, 
    newPasswordError2: string 
}



const inputStyle: SxProps = {
    backgroundColor: "var(--background-color2) !important",
    '> *': {
       
        color: "var(--text-color) !important",
    }
}

const WrapperStyle: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    borderBottom: "1px solid lightblue",
    paddingBottom: "20px",
    gap: "0.7rem"
}



const ChangePasswordModal = ({isModalOpen, setIsModalOpen}: {isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    }): JSX.Element => {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPassword2, setNewPassword2] = useState("")
    const [formErrors, setFormErrors] = useState<passwordErrorType>({oldPasswordError: "", newPasswordError: "", newPasswordError2: "" })
    const updateSnackbar = useUpdateSnackbar()

    const controller = new AbortController()

    const changePassword = (): void => {
        let errors: passwordErrorType = {oldPasswordError: "", newPasswordError: "", newPasswordError2: "" }
        if(newPassword.length<authorizationStandard.MINIMUM_PASSWORD){ 
            errors.newPasswordError = authorizationErrors.PASSWORD_TO_SHORT
        }    
        if(newPassword !== newPassword2){
            errors.newPasswordError2 = authorizationErrors.PASSWORD_DOESNT_MATCH
        }
        
        if(errors.newPasswordError!=="" || errors.newPasswordError2!=="" || errors.oldPasswordError!==""){
            setFormErrors(errors)
            return
        }
        
        const body = {
            oldPassword: oldPassword,
            newPassword: newPassword
        }
        
        const { signal } = controller

        fetch(urlOfChangePassword,{
            method: "PATCH",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if("error" in response){
                    setFormErrors({oldPasswordError: response.error, newPasswordError: "", newPasswordError2: "" })
                    return
                }
                setFormErrors({oldPasswordError: "", newPasswordError: "", newPasswordError2: "" })
                updateSnackbar.addSnackBar({snackbarText: "Password changed successfully", severity: "success"})
                setIsModalOpen(false)
                setOldPassword("")  
                setNewPassword("") 
                setNewPassword2("")  
                
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
            aria-labelledby="change password modal"
            aria-describedby="change password modal"
        >
            <Box sx={ModalStyle} >
                <Grid sx={WrapperStyle}>
                   
                        <TextField
                            error = {formErrors.oldPasswordError !== ''}
                            helperText={formErrors.oldPasswordError}
                            required
                            sx={inputStyle}
                            value={oldPassword}
                            label="Old Password"
                            type="password"
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <TextField
                            error = {formErrors.newPasswordError !== ''}
                            required
                            sx={inputStyle}
                            value={newPassword}
                            label="New Password"
                            helperText={formErrors.newPasswordError}
                            type="password"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            error = {formErrors.newPasswordError2 !== ''}
                            required
                            sx={inputStyle}
                            value={newPassword2}
                            label="New Password-repeat"
                            helperText={formErrors.newPasswordError2}
                            type="password"
                            onChange={(e) => setNewPassword2(e.target.value)}
                        />
                  
                </Grid>
                <Grid sx={AlignRight}>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={()=>setIsModalOpen(false)} color="error">Cancel</Button>
                        <Button onClick={()=>changePassword()}>Change</Button>
                    </ButtonGroup>
                </Grid>
            </Box>
        </Modal>
    )
}

export default ChangePasswordModal