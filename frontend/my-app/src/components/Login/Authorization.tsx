

import AccountBoxSharpIcon from '@mui/icons-material/AccountBoxSharp';
import { TextField, Modal, Box, Link, } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import Button from '@mui/material/Button';
import { ModalStyle } from '../ChatRoom/Modals/ModalStyle';
//HELPERS
import { useState, useReducer, useEffect } from 'react';
import { urlOfLogin, urlOfSignUp } from '../../apiRoutes';
//COMPONENTS
//TYPES
import { SxProps } from '@mui/system';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { useUpdateSnackbar } from '../../SnackBarContext';


const inputStyle: SxProps = {
    backgroundColor: "var(--background-color2) !important",
    '> *': {
       
        color: "var(--text-color) !important",
    }
}

const WrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    borderBottom: "1px solid lightblue",
    paddingBottom: "20px",
    gap: "0.5rem"
}

const marginTop: CSSProperties = {
    marginTop: "0.5rem"
}

const IconStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center"
}
  
const LENGTH = {
    MINIMUM_PASSWORD: 8,
    MINIMUM_USERNAME: 3,
    MAXIMUM_USERNAME: 32,
}

const ERRORS = {
    USERNAME_TAKEN: "Username already taken",
    USERNAME_TO_SHORT: `Username must be at least ${LENGTH.MINIMUM_USERNAME} characters`,
    USERNAME_TO_LONG: `Username must be less than ${LENGTH.MAXIMUM_USERNAME} characters`,
    PASSWORD_TO_SHORT: `Password must be at least ${LENGTH.MINIMUM_PASSWORD} characters`,
    PASSWORD_DOESNT_MATCH: "Passwords doesn't match",
    PASSWORD_TOO_WEAK: "Passwords too weak",
    INCORRECT_CREDENTIALS: "Incorrect username or password",
}  

export {ERRORS as authorizationErrors, LENGTH as authorizationStandard}

const ACTIONS = {
    USERNAME_ERROR: "usernameError",
    PASSWORD_ERROR: "passwordError",
    PASSWORD_ERROR2: "passwordError2",
}  



const formErrorsReducer = (state: any, action: any) => {
    switch(action.type){
        case ACTIONS.USERNAME_ERROR:
            return {
                ...state,
                "usernameError": action.payload.error
            }
        case ACTIONS.PASSWORD_ERROR:
            return {
                ...state,
                "passwordError": action.payload.error
            }
        case ACTIONS.PASSWORD_ERROR2:  
            return {
                ...state,
                "passwordError2": action.payload.error
            }
        default:
            return state      
    }
}

const controller = new AbortController()

const Authorization = ({showModal, setShowModal, setIsLoginModalOpen, isLoginModalOpen}:
    {showModal: boolean, setShowModal: Function, setIsLoginModalOpen: Function, isLoginModalOpen: boolean,}): 
    JSX.Element => {

    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [username, setUsername] = useState("")

    const [formErrors, dispatchFormErrors] = useReducer(formErrorsReducer, {passwordError: "", usernameError: "", passwordError2: "" })
    
    const updateSnackbar = useUpdateSnackbar()
    
    const authorizeUser = (): void =>{
        cleanErrors()

        if(isLoginModalOpen) loginUser()
        else signUpUser()
    }

    const cleanErrors = (): void => {
        dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: ""} })
        dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR2, payload: {error: ""} })
        dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ""} })
    }

    const signUpUser = () => {

        let anyError: boolean = false
        if(password.length<LENGTH.MINIMUM_PASSWORD){ 
            dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: ERRORS.PASSWORD_TO_SHORT} })
            anyError = true
        }    
        if(username.length<LENGTH.MINIMUM_USERNAME) {
            dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ERRORS.USERNAME_TO_SHORT} })
            anyError = true
        }    
        if(username.length>LENGTH.MAXIMUM_USERNAME){ 
            dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ERRORS.USERNAME_TO_LONG} })
            anyError = true
        }
        if(password !== password2){
            dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR2, payload: {error: ERRORS.PASSWORD_DOESNT_MATCH} })
            anyError = true
        }

        if(anyError) return

        const { signal } = controller

        const body = {
            "username": username,
            "password": password
        }
        
        fetch(urlOfSignUp,{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {            

                if(!response.error){
                    setPassword("")
                    setUsername("")
                    setIsLoginModalOpen(true)
                    updateSnackbar.addSnackBar({snackbarText: "Sign up successfully", severity:"success"})
                    return
                }
                if(response.error.includes("Username")){
                    dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: response.error} })
                }
                if(response.error.includes("Password")){
                    dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: response.error} })
                }

                return  
            })
            .catch(error=>{console.log(error)})
        
    }

    const loginUser = (): void => {
        

        let anyError: boolean = false
        if(password.length<LENGTH.MINIMUM_PASSWORD){ 
            dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: ERRORS.PASSWORD_TO_SHORT} })
            anyError = true
        }    
        if(username.length<LENGTH.MINIMUM_USERNAME) {
            dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ERRORS.USERNAME_TO_SHORT} })
            anyError = true
        } 
        if(anyError) return

        const body = {
            "username": username,
            "password": password
        }

        const { signal } = controller
        fetch(urlOfLogin,{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {    
                console.log(response)        
                if(!("error" in response)){
                    setShowModal(false)
                    localStorage.setItem("token", response.accessToken)
                    const snackBarInfo = {message: "Login successfully", severity: "success"}
                    sessionStorage.setItem("snackbar", JSON.stringify(snackBarInfo))
                    window.location.reload()
                    return
                }
                if(response.error.includes("username")){
                    dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: response.error} })
                }
                if(response.error.includes("password")){
                    dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: response.error} })
                }
            })
            .catch(error=>{console.log(error)})
    }

    const openDifferentModal = (): void => {
        clearData()
        setIsLoginModalOpen(!isLoginModalOpen)
    }

    const clearData = (): void => {
        setUsername("")
        setPassword("")
        setPassword2("")
        cleanErrors()
    }


    useEffect(() => {
        return () => {
            controller.abort()
        }
    }, []);
    

    return (

        <Modal
            open={showModal}
            onClose={() => {clearData(); setShowModal(false)}}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
            <Box style={ModalStyle}>
                <div style={WrapperStyle}>
                    <span style={IconStyle}><AccountBoxSharpIcon></AccountBoxSharpIcon></span>
                
                        <TextField
                            error = {formErrors.usernameError !== ''}
                            required
                            sx={inputStyle}
                            value={username}
                            helperText={formErrors.usernameError}
                            label="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            error = {formErrors.passwordError !== ''}
                            required
                            sx={inputStyle}
                            value={password}
                            label="password"
                            helperText={formErrors.passwordError}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {!isLoginModalOpen? 
                        <TextField
                            error = {formErrors.passwordError2 !== ''}
                            required
                            sx={inputStyle}
                            value={password2}
                            label="password-repeat"
                            helperText={formErrors.passwordError2}
                            type="password"
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                        : null}
                        <div className='container-wrap--align-right'>
                            <div >
                                <Button onClick={() => authorizeUser()}  variant="contained" endIcon={<LoginIcon />}>{isLoginModalOpen? "Login": "SignUp"}</Button>
                            </div>
                            <div style={marginTop} className='font0-9rem'> 
                                {isLoginModalOpen?
                                    <div className='font0-9rem'>if you dont have account sign up&nbsp;
                                        <Link onClick={() => openDifferentModal()}>
                                            {'here'}
                                        </Link>  
                                    </div>
                                :
                                    <div className='font0-9rem'>if you already have account login&nbsp;
                                        <Link onClick={() => openDifferentModal()}>
                                            {'here'}
                                        </Link>  
                                    </div>
                                }
                            </div>
                        </div>
                
                </div>  
            </Box>
        </Modal>
 
  );
}

export default Authorization;