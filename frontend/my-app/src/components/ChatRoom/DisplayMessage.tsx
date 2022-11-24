import { Divider, Fab, Grid, InputBase, ListItem, ListItemText, Chip } from "@mui/material"
import { ContainerForTextFieldStyle, EmojiBox, MessageBoxListItemStyle } from "./MessageBoxStyle"
import SendIcon from '@mui/icons-material/Send'
//COMPONENTS
import AvatarComponent from "../User/Avatar"
import HoverToolBar from "./HoverToolBar"
//HELPERS
import { EmojiReaction, Message } from "../../types/types"
import { useUser } from "../../UserContext"
import { urlOfDeleteMessage, urlOfEmojiReaction } from "../../apiRoutes"
import { useChannel } from "./ChatRoom"
import { useCallback, useRef, useState, useLayoutEffect} from "react"
import { displayDates } from "../../helper"
//TYPES
import {deleteModalInfo} from "./MessageBox"


type dataPassed = {
    messageEdited: string,
    setMessageEdited: React.Dispatch<React.SetStateAction<string>>, 
    setMessageEditedId: React.Dispatch<React.SetStateAction<string | null>>,
    messageEditedId: string|null,
    listOfAllMessages: Message[],
    clickedDescendantOfToolbar: (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) => void , 
    setRowHeight: (index: number, size: number) => void, 
    lastSeenMessageId: {frontend: string, backend: string}, 
    messageHoveredId: string | null, 
    setDeleteMessageModalInfo: React.Dispatch<React.SetStateAction<deleteModalInfo>>,
    setMessageHoveredId: React.Dispatch<React.SetStateAction<string | null>>,
    showBBCodeEditor: (idOfElement: string) => void,
    handleContextMenu: (event: React.MouseEvent, index: number) => void
}

const DisplayMessage = ({ index, style, data }: {index: number, style: any, data: dataPassed}): JSX.Element => {
    
    const [isHoverBarVisible, setIsHoverBarVisible] = useState(false)
    const newMessageBadge = useRef<any>({})
    const user = useUser()
    const [node, setNode] = useState<HTMLElement >()
    const textArea = useRef()
    const channelInfo = useChannel()

    const handleRect = useCallback((node: HTMLElement|null ) => {
        if(node){
            setNode(node);
        }
    }, [])

    let message: Message = data.listOfAllMessages[index]
    let previousMessage: Message|undefined = data.listOfAllMessages[index-1]
    

    const diffInHoursBetweenTwoDates = (dt2: Date, dt1: Date): number => {
        let differenceInHours =(dt2.getTime() - dt1.getTime()) / 1000
        differenceInHours /= (60 * 60)
        return Math.abs(Math.round(differenceInHours))
    }

    const checkingPreviousMessageDateAndSender = (message: Message, previousMessage: Message|undefined): boolean => {
        if(previousMessage!==undefined){
            const sameUserIsSender: boolean = message.user_id === previousMessage.user_id
            if(sameUserIsSender){
                const currentDate: Date = new Date(message.date_of_posting)
                const previousMessageDate: Date = new Date(previousMessage.date_of_posting)
                if(diffInHoursBetweenTwoDates(currentDate, previousMessageDate)<3){
                    return false
                }
            }
            return true
        }
        return true
    }
    
    const wasPreviousMessageFromSameUserAndRecently: boolean =  checkingPreviousMessageDateAndSender(message, previousMessage)
    let extraMargin = wasPreviousMessageFromSameUserAndRecently? 18: 0

    const sendEmojiReaction = (method: string, messageId: string, emoji: EmojiReaction): void => {
        const { signal } = channelInfo.controller
            fetch(urlOfEmojiReaction+messageId+`?emoji=${emoji}`,{
                method: method,
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + localStorage.getItem("token") || ""
                }})

            .then(response => response.json())
            .then(response => {
                if("error" in response) console.log(response.error)
            })
            .catch(error=>{console.log(error)})
    }  
  
    const changeHeight = ({a=false}: {a?: boolean}) => {
        if (node) {
            let height = node.clientHeight
                
            data.setRowHeight(index,  height);
        }
    }
    
    useLayoutEffect( () => {

        changeHeight({a: false})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.messageEditedId, data.messageEdited, data.listOfAllMessages.length]);



    useLayoutEffect( () => {
        changeHeight({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node?.clientHeight,newMessageBadge.current.clientHeight, message.emojis]);
    
    let margin = {
        marginTop: extraMargin
    }  

    

    const convertMessageToHtml = (message: string): string => {
        let messageText: string =  message
        
        let BBCodeRegExMap: any = {
            'bold': {
                regExpression: /\[b](.*?)\[&#x2F;b]/g, 
                replacement:  "<strong>$1</strong>",
            },
            'italic': {
                regExpression: /\[i](.*?)\[&#x2F;i]/g, 
                replacement:  "<em>$1</em>",
            },
            'CrossedOut': {
                regExpression: /\[s](.*?)\[&#x2F;s]/g, 
                replacement:  "<span style='text-decoration: line-through'>$1</span>",
            },
            'image': {
                // eslint-disable-next-line
                regExpression: /(https?:\&#x2F;\&#x2F;.*\.(?:png|jpg))/g,
                replacement: `<img style='max-height: 350px; display: block; width: 100%' src=$&></img>`,
            },
            'link': {
                // eslint-disable-next-line
                regExpression: /(?:(?:(^|\s)https?|ftp|file):\&#x2F;\&#x2F;|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\&#x2F;%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\&#x2F;%=~_|$])/igm,
                replacement: `<a style='text-decoration: none; color: rgb(64, 165, 193)' href=$&>$&</a>`
            },
        
            'new line': {
                regExpression: /\n+/g,
                replacement: `<br />`
            }

        };
        
        for (let i in BBCodeRegExMap) {
            messageText = messageText.replace(BBCodeRegExMap[i]["regExpression"],BBCodeRegExMap[i]["replacement"])


        }

        return messageText
    }

    const handleKeypressInEditedMessageTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            editMessage()
        }
    }

    const editMessage = (): void => {
        if(data.messageEdited==="") return
        const { signal } = channelInfo.controller
        const body = {
            message: data.messageEdited,
        }
        fetch(urlOfDeleteMessage+data.messageEditedId,{
            method: "PATCH",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)) {
                    data.setMessageEdited("")
                    data.setMessageEditedId(null)
                }
                return
            })
            .catch(error=>{console.log(error)})
    }

    const selectedTextArea = (): void => {
        data.showBBCodeEditor("Edited-Message-Area")
    }

    return(
        <Grid style={style}>
            <Grid sx={{padding: 0}} ref={handleRect}>
                {data.lastSeenMessageId.frontend === message.id? <Divider > <Chip sx={{color: "var(--text-color)"}} label="New Message" /></Divider>: null}
                <ListItem sx={{padding: 0}}  onMouseLeave={()=>{setIsHoverBarVisible(false)}} onMouseOver={()=>setIsHoverBarVisible(true)} key={`listItem${index}`}>
                
                    <Grid sx={MessageBoxListItemStyle} key={index} style={margin}  className='container' direction="row" container>
                        <Grid  item xs={1} sx={{ height: "100%" }}>
                            { wasPreviousMessageFromSameUserAndRecently ?
                               
                                    <AvatarComponent  name={message.username}></AvatarComponent>
                                 
                                :null
                            }
                        </Grid>
                        <Grid item  direction="row" xs={11} container   >
                            { wasPreviousMessageFromSameUserAndRecently ?
                                <Grid  item xs={11} >
                                    <ListItemText sx={{margin:"0", paddingTop: "0px !important", paddingBottom: "0px" }} >
                                        {message.username} &nbsp;
                                        <span style={{fontSize: "0.8rem"}}>{displayDates(message.date_of_posting)} </span>


                                    </ListItemText>
                                </Grid>
                                :null
                            }
                            <Grid item xs={12}>
                                {data.messageEditedId !== message.id?
                                    <ListItemText style={{margin:"0"}}>
                        
                                        <span dangerouslySetInnerHTML={{__html:convertMessageToHtml(message.message_text)}}/>
                                    </ListItemText>
                                    :
                                    <Grid sx={ContainerForTextFieldStyle} container component="form">
                                        <InputBase
                                            ref={textArea}
                                            onSelect={() => selectedTextArea()}
                                            onKeyDown={(e)=>handleKeypressInEditedMessageTextArea(e)}
                                            spellCheck="false" autoComplete='off' 
                                            key={`editedTextField ${index}`}
                                            onBlur={(e) => data.clickedDescendantOfToolbar(e) }
                                            id="Edited-Message-Area"
                                            value={data.messageEdited}
                                            onChange={(e)=>{
                                                data.setMessageEdited(e.target.value)  
                                            }}
                                            multiline
                                            sx={{ flexGrow: "1" }}
                                            placeholder="Edited Message"
                                            inputProps={{ 'aria-label': 'text field' }}
                                        
                                        />
                                        <div style={{position: "relative", marginTop: "0rem", paddingTop: "0rem", top: "0rem"}}>
                                
                                            <Fab onClick={()=>editMessage()} sx={{transform: "scale(0.4)"}} color="primary" aria-label="add"> <SendIcon  ></SendIcon ></Fab>
                                        </div>
                                    </Grid>
                                }
                            </Grid>
                            <Grid item xs={12}>
                                {Object.keys(message.emojis).map((keyName: any, i: number) => {                                      
                                    const didCurrentUserReactedWithEmoji: boolean =  message.emojis[keyName].some(e => e.userId.toString() === user.userInfo?.id)
                                    return(
                                        <span key={`emoji${i}`}>
                                            <ListItemText onClick={()=>sendEmojiReaction(didCurrentUserReactedWithEmoji? "DELETE": "POST", message.id, keyName)} key={`EmojiReaction${i}`} sx={EmojiBox} >
                                                {keyName} {message.emojis[keyName].length}
                                            </ListItemText>
                                        </span>
                                    )                 
                                })}
                            </Grid>    
                        </Grid>
                        {(isHoverBarVisible || data.messageHoveredId===message.id) && data.messageEditedId!==message.id? <HoverToolBar sendEmojiReaction={sendEmojiReaction} message={message} 
                            setDeleteMessageModalInfo={data.setDeleteMessageModalInfo} setMessageHoveredId={data.setMessageHoveredId} setMessageEdited={data.setMessageEdited}
                            messageHoveredId={data.messageHoveredId} idOfMessageEdited={data.messageEditedId} setMessageEditedId={data.setMessageEditedId}></HoverToolBar>
                            : null
                        }
                    </Grid>
                </ListItem>
            </Grid>
        </Grid>
    )
}


export default DisplayMessage