import { Grid, IconButton, InputBase, Tooltip, Fab } from "@mui/material";
import SendIcon from '@mui/icons-material/Send'
import {ContainerForTextFieldStyle, emojiPickerStyle} from "./MessageBoxStyle"
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
//HELPERS
import { useEffect, useState } from "react";
import { urlOfPostMessage } from "../../apiRoutes";
import { useChannel } from "./ChatRoom";
import { useRef } from "react";
//COMPONENT
import Picker from 'emoji-picker-react'

const TextArea = ({clickedDescendantOfToolbar, showBBCodeEditor, setMessage, message}: 
    {   
        message: string,
        setMessage: React.Dispatch<React.SetStateAction<string>>
        clickedDescendantOfToolbar: (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) => void
        showBBCodeEditor: (idOfElement: string) => void
    }): JSX.Element => {
    
    const[showEmojiPicker, setShowEmojiPicker] = useState(false)
    const textArea = useRef()
    
    const onEmojiClick = (_event: any, emojiObject: any) => {
        setMessage(message+emojiObject.emoji)
    }

    const channelInfo = useChannel() 

    useEffect(() => {
        document.addEventListener("keydown", closeEmojiPicker, false)

        return () => {
            document.removeEventListener("keydown", closeEmojiPicker, false)
        }
    }, []);

    const escapePressed = (event: any): void => {
        if (event.key === "Escape") {
            setShowEmojiPicker(false)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", escapePressed, false)
    }, []);

    const sendMessage = (): void => {
        if(message==="") return
        const { signal } = channelInfo.controller
        
        const body = {
            message: message,
        }
        setMessage("")
  
        fetch(urlOfPostMessage+channelInfo.channelId,{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response))setMessage("")
                return
            })
            .catch(error=>{console.log(error)})
    }

    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        //it triggers by pressing the enter key without shift
        if (e.key=== 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }
    
    const selectedTextArea = (): void => {
        showBBCodeEditor("Message-Area")
    }

    const closeEmojiPicker = (e: any): void => {
        if (e.key=== 'Escape' && !e.shiftKey) setShowEmojiPicker(false)
    }

    return (
        <Grid sx={ContainerForTextFieldStyle} container  component="form">
            <InputBase
                ref={textArea}
                onKeyPress={(e)=>handleKeypress(e)}
                spellCheck="false" autoComplete='off' 
                onSelect={() => selectedTextArea()}
                id="Message-Area"
                value={message}
                onBlur={(e) => clickedDescendantOfToolbar(e) }
                onChange={(e)=>{setMessage(e.target.value)}}
                multiline
                sx={{ flexGrow: "1" }}
                placeholder="Type something"
                inputProps={{ 'aria-label': 'text field' }}
            />
            
            <div style={{position: "relative", marginTop: "0rem", paddingTop: "0rem", top: "0rem"}}>
                {showEmojiPicker? <Grid sx={emojiPickerStyle} ><Picker onEmojiClick={onEmojiClick} /></Grid>: null}
                <IconButton onClick={()=>setShowEmojiPicker(!showEmojiPicker)} color="primary" aria-label="add emoji" component="span">
                    <Tooltip title="Add Emoji" placement="top">
                        <EmojiEmotionsIcon sx={{transform: "scale(1.1)"}} />
                    </Tooltip>
                </IconButton>
                <Fab onClick={()=>sendMessage()} sx={{transform: "scale(0.4)"}} color="primary" aria-label="add"> <SendIcon  ></SendIcon ></Fab>
            </div>
        </Grid>
    )
}

export default TextArea