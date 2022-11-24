
import { Grid, ButtonGroup, IconButton, Tooltip, ClickAwayListener } from '@mui/material'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
//HELPERS
import { useEffect, useState } from "react"
import { useChannel } from "./ChatRoom"
//TYPES
import { Message,  EmojiReaction } from "../../types/types"
import { SxProps } from "@mui/system"

const EmojiToPickBox: SxProps = {
    userSelect: "none",
    width: "1.2rem",
    '&:hover': {
        borderColor: "red",
        backgroundColor: "var(--theme-hovered) !important",
    }
}

const EmojiPicker: SxProps = {
    zIndex: "99999",
    justifyContent: "center"
}

const HoverToolBar = ({message, setDeleteMessageModalInfo, sendEmojiReaction, messageHoveredId, setMessageHoveredId, setMessageEditedId, setMessageEdited, idOfMessageEdited}:
    {message: Message, setDeleteMessageModalInfo: Function, sendEmojiReaction: Function,
    setMessageEditedId: React.Dispatch<React.SetStateAction<string | null>>
    messageHoveredId: string|null, setMessageHoveredId: Function, setMessageEdited: Function, idOfMessageEdited: string|null})
    : JSX.Element => {
    const[IsEmojiBeingAdded, setIsEmojiBeingAdded] = useState(false)
    
    const channelInfo = useChannel()
    
    const userCanDeleteThisMessage: boolean = channelInfo.userChannelInfo  !== undefined && 
        (channelInfo.userChannelInfo.is_owner_of_channel  || channelInfo.userChannelInfo.id === message.user_id.toString())
    const userCanEditThisMessage: boolean = channelInfo.userChannelInfo !== undefined && channelInfo.userChannelInfo.id === message.user_id.toString()

    const tooltipClassExtension: string = (messageHoveredId === null && idOfMessageEdited !== message.id) ? "hoverable": messageHoveredId === message.id? "hovered": ""
    
    useEffect(() => {
        return () => {
            setMessageHoveredId(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openEmojiPicker = () => {

        if(IsEmojiBeingAdded !== false) {
            setMessageHoveredId(null)
        }
        else{
            setMessageHoveredId(message.id)
        }
        setIsEmojiBeingAdded(!IsEmojiBeingAdded)
    }
    
    const decodeHTMLEntities = (str: string): string => {
        var element = document.createElement('div')
        if(str && typeof str === 'string') {
          // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            if(element.textContent) str = element.textContent;
            element.textContent = '';
    
        }
    
        return str;
      }


    return (
        <Grid className={`tooltip ${tooltipClassExtension}`}>
            <ButtonGroup   >
                {userCanDeleteThisMessage?
                    (<IconButton onClick={()=>setDeleteMessageModalInfo({isModalOpen: true, idOfDeletedMessage: message.id})} color="primary" aria-label="delete message" component="span">
                        <Tooltip title="Delete" placement="top">
                            <DeleteIcon />
                        </Tooltip>
                    </IconButton>): null}
                {userCanEditThisMessage?
                    <IconButton onClick={()=>{setMessageEdited(decodeHTMLEntities(message.message_text)); setMessageEditedId(message.id)}} color="primary" aria-label="edit message" component="span">
                        <Tooltip title="Edit" placement="top">
                            <EditIcon />
                        </Tooltip>
                    </IconButton>: null
                }
                <IconButton onClick={() => openEmojiPicker()} color="primary" aria-label="add emoji" component="span">
                    <Tooltip title="Add Emoji" placement="top">
                        <EmojiEmotionsIcon />
                    </Tooltip>
                </IconButton>
            </ButtonGroup>
            {IsEmojiBeingAdded? 
                <Grid sx={EmojiPicker} container>
                
                    {Object.values(EmojiReaction).map((keyName: any, i: number) => (
                        <ClickAwayListener key={`clickAway${i}`} onClickAway={openEmojiPicker}>
                            <Grid xs={12/5} item sx={EmojiToPickBox} onClick={()=>sendEmojiReaction("POST", message.id, keyName)} >
                                <span>
                                    {keyName}
                                </span>
                            </Grid>
                        </ClickAwayListener>
                    ))}
                </Grid>
                :null
            }
        </Grid>
        
    )
}

export default HoverToolBar