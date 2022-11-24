

import { Grid, Paper, Divider, Box} from '@mui/material'
import * as React from 'react'
import {MessageBoxStyle, boxHeight} from "./MessageBoxStyle"
//HELPERS
import { urlOfMessagesChannel, urlOfMarkingLastMessageSeenInChannel } from '../../apiRoutes'
import { useUser } from '../../UserContext'
import { useChannel } from '../ChatRoom/ChatRoom'
import useArray from '../../customHooks/useArray'
import { useState, useEffect, useRef, forwardRef, useCallback} from 'react'
//COMPONENTS
import TextArea from './TextArea'
import DeleteMessageModal from './Modals/DeleteMessageModal'
import {  VariableSizeList } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer"
import SkeletonMessages from "./SkeletonMessages"
import DisplayMessage from './DisplayMessage'
import ToolBar from './ToolBar'
//TYPES
import { Message, EditedMessageContent, EmojiInfo, EmojiReaction, EmojiReactionInfo, MenuPosition, UserInContextMenu } from '../../types/types'
import UserContextMenu from '../ContextMenus/UserContextMenu'
import { SxProps } from '@mui/system'


const innerElementType = forwardRef(({ style, ...rest }:{style: any}, ref: any) => {
        
    return(
        <div
            ref={ref}
            style={{
                ...style,
                height: `${parseFloat(style.height) + 15 * 2}px`
            }}
            {...rest}
        />
    )
})

export type deleteModalInfo = {
    isModalOpen: boolean
    idOfDeletedMessage?: string
}

export type editedMessageInfo = {
    id: string|null,
    text: string
}

const newConversationStyle: SxProps = {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    display: "flex"
    
}

const MessageBox = (): JSX.Element => {
    const[message, setMessage] = useState("")
    const[messageEdited, setMessageEdited] = useState<string>("")
    const[messageEditedId, setMessageEditedId] = useState<string|null>(null)
    const[textModifiedByToolbarInfo, setTextModifiedByToolbarInfo] = useState({position: [0, 0], changeSelectionForUser: false})
    const[isToolbarVisible, setIsToolbarVisible] = useState<boolean>(false)
    const listOfAllMessages = useArray<Message>([])
    const[deleteMessageModalInfo, setDeleteMessageModalInfo] = useState<deleteModalInfo>({isModalOpen: false})
    const[messageHoveredId, setMessageHoveredId] = useState<string|null>(null)
    const[areMessageFetched, setAreMessagesFetched] = useState(false)
    const[lastSeenMessageId, setLastSeenMessageId] = useState<{frontend: string, backend: string}>({frontend: "1", backend: "1"})
    const[isScrolledToTheBottom, setIsScrolledToTheBottom] = useState(true)
    const[dynamicList, setDynamicList] = useState<VariableSizeList>()
    const rowHeights = useRef<any>({});
    const [textAreaModified, setTextAreaModified] = useState<HTMLElement|null>(null)
    const [contextMenu, setContextMenu] = useState<MenuPosition>(null)
    const[userInContextMenu, setUserInContextMenu] = useState<UserInContextMenu|undefined>()
   
    const user = useUser()
    const channelInfo = useChannel()

    const handleRect = useCallback((node: any) => {
        setDynamicList(node);
    }, [])

    const escapePressed = (event: any): void => {
        if (event.key === "Escape") {
            setMessageEdited("")
            setMessageEditedId(null)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", escapePressed, false)
    }, []);

    useEffect(() => {
       
        if(dynamicList && areMessageFetched) {
            dynamicList.scrollToItem(listOfAllMessages.array.length, "end")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dynamicList, areMessageFetched])

    useEffect(() => {
        if(dynamicList && isScrolledToTheBottom){
            dynamicList.scrollToItem(listOfAllMessages.array.length, "end")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listOfAllMessages.array.length])

    useEffect(() => {
        if(!areMessageFetched || channelInfo.userChannelInfo?.last_message_seen_id === undefined) return
        if(listOfAllMessages.array.length === 0) return

        if(channelInfo.userChannelInfo?.last_message_seen_id === null){
            setLastSeenMessageId({frontend: listOfAllMessages.array[0].id, backend: listOfAllMessages.array[0].id})
            return
        }

        const result = listOfAllMessages.array.find(element => {
            const isLastMessageSeenByUserUnDefined = channelInfo.userChannelInfo?.last_message_seen_id===null || channelInfo.userChannelInfo?.last_message_seen_id===undefined
            if(isLastMessageSeenByUserUnDefined)  return false
            return parseInt(element.id) > channelInfo.userChannelInfo?.last_message_seen_id!
            
            
        })

        const didUserSeenAllMessages = result 
        if(didUserSeenAllMessages) setLastSeenMessageId({frontend: result?.id, backend: result?.id})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelInfo.userChannelInfo?.last_message_seen_id, areMessageFetched])

    useEffect(() => {

        if(user.socket === undefined) return
       
        user.socket.on('send-message', (message: Message) => {
            listOfAllMessages.push(message)
        })
        user.socket.on('edit-message', (message: EditedMessageContent) => {
         
            listOfAllMessages.updateObjectByKey("id", message.messageId.toString(), [
                {field: "edited_on", fieldValue: message.editedTime},
                {field: "message_text", fieldValue: message.editedText}
            ])   
        })

        user.socket.on('delete-message', (id: number) => {
            listOfAllMessages.removeByKey("id", id.toString())
        })

        user.socket.on('add-emoji', (emoji: EmojiReaction, emojiInfo: EmojiReactionInfo, messageId: number) => {
            let index: number = listOfAllMessages.findIndexByKey("id", messageId.toString())
            if(emoji in listOfAllMessages.array[index].emojis) {
                listOfAllMessages.updateObjectByIndex(index, [
                    {field: "emojis", fieldValue: {...listOfAllMessages.array[index].emojis, [emoji]: [...listOfAllMessages.array[index].emojis[emoji], emojiInfo]}}     
                ])
            }
            else(
                listOfAllMessages.updateObjectByIndex(index, [
                    {field: "emojis", fieldValue: {...listOfAllMessages.array[index].emojis, [emoji]: [emojiInfo]}}     
                ])
            )
        })

        user.socket.on('delete-emoji', (emoji: EmojiReaction, userId: number, messageId: number) => {
            let index: number = listOfAllMessages.findIndexByKey("id", messageId.toString())
            if(listOfAllMessages.array[index].emojis[emoji].length === 1){
                listOfAllMessages.updateObjectByIndex(index, [
                    {field: "emojis", fieldValue: Object.keys(listOfAllMessages.array[index].emojis).filter(key =>
                        key !== emoji).reduce((obj: any, key) =>
                        {
                            obj[key] = listOfAllMessages.array[index].emojis[key];
                            return obj;
                        }, {}
                    )}     
                ])
            }
            else{
                listOfAllMessages.updateObjectByIndex(index, [
                    {field: "emojis", fieldValue: {...listOfAllMessages.array[index].emojis, [emoji]: listOfAllMessages.array[index].emojis[emoji].filter(emojiInfo => emojiInfo.userId !== userId)}}     
                ])
            }
           
        })
        return () => {
            if(user.socket !== undefined) {
                user.socket.off('connect')
                user.socket.off('send-message')
                user.socket.off('edit-message')
                user.socket.off('delete-message')
                user.socket.off('add-emoji')
                user.socket.off('delete-emoji')
            }
         }
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.socket, listOfAllMessages, channelInfo.channelId])

    useEffect(() => {
        if(channelInfo.channelInfo?.name !== undefined) document.title = channelInfo.channelInfo?.name

    }, [channelInfo.channelInfo?.name]);

    useEffect(() => {
     
        setMessage("")
        setMessageEdited("")
        setMessageEditedId(null)
        setMessageHoveredId(null)
        setAreMessagesFetched(false)
      
        const fetchMessages = () =>{
            const { signal } = channelInfo.controller
            fetch(urlOfMessagesChannel+channelInfo.channelId,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + localStorage.getItem("token") || ""
                }})
            .then(response => response.json())
            .then(response => {
                
                if("error" in response){
                    setAreMessagesFetched(true)
                    return
                }

                let messages = response.messages
                
                for(let i=0; i<messages.length; i++){
                    let emojisGrouped: EmojiInfo = {}
                    for(let j=0; j<messages[i].emojis.length; j++){
                        if(messages[i].emojis[j].emoji === null) continue
                        
                        if(messages[i].emojis[j].emoji in emojisGrouped) {
                            
                            emojisGrouped[messages[i].emojis[j].emoji].push({
                                "username": messages[i].emojis[j].username,
                                "userId": messages[i].emojis[j].user_id
                            })
                        
                            continue
                        }
                        emojisGrouped[messages[i].emojis[j].emoji] = [{
                            "username": messages[i].emojis[j].username,
                            "userId": messages[i].emojis[j].user_id
                        }]
                    }
                    messages[i].emojis = emojisGrouped
                }
                listOfAllMessages.set(messages)
                setAreMessagesFetched(true)
                return
            })
            .catch(error=>{console.log(error)})
        }
        if(channelInfo.channelId !== null) fetchMessages()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelInfo.channelId])

    useEffect((): void => {
        if(!textModifiedByToolbarInfo.changeSelectionForUser || textAreaModified === null) return

        let textarea = textAreaModified as any
        textarea.focus()
        textarea.setSelectionRange(textModifiedByToolbarInfo.position[0], textModifiedByToolbarInfo.position[1])
        setTextModifiedByToolbarInfo({...textModifiedByToolbarInfo, changeSelectionForUser: false})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, messageEdited])

    const getRowHeight = (index: number): number => {
        return rowHeights.current[index] -3 || 82;
    }
    
    const setRowHeight = (index: number, size: number) => {
        if(rowHeights.current[index]=== size) return
        if(dynamicList) dynamicList.resetAfterIndex(0, true)
        rowHeights.current = { ...rowHeights.current, [index]: size };
    }

    const handleContextMenu = (event: React.MouseEvent, index: number) => {

        event.preventDefault();
        if(listOfAllMessages.array[index].user_id.toString()===user.userInfo?.id){
          setUserInContextMenu({
            isFriend: false,
            id: listOfAllMessages.array[index].user_id.toString(),
            sameUserAsCurrentlyLogged: true,
            username: listOfAllMessages.array[index].username,
            channelInfoInContext: null
          })
        }
        else{
          setUserInContextMenu({
            isFriend: user.userFriends.some((friend)=>{
              let friendId = friend.user_one_id!==user.userInfo?.id? friend.user_one_id: friend.user_two_id
              return friendId === listOfAllMessages.array[index].user_id.toString()
            }),
            id: listOfAllMessages.array[index].user_id.toString(),
            username: listOfAllMessages.array[index].username,
            channelInfoInContext: channelInfo.channelId!==null?{
              id: channelInfo.channelId,
              canKickUser: channelInfo.userChannelInfo?.is_owner_of_channel!==undefined? channelInfo.userChannelInfo?.is_owner_of_channel: false
            }
            : null
          })
        }
        setContextMenu(
            contextMenu === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
            }
            : 
            null,
        );
      }
    
    const scrollCheck = (event: any): void => {
        const isScrollAtTheBottom = event.target.scrollHeight - event.target.scrollTop - event.target.clientHeight < 1

        if (!isScrollAtTheBottom) {
            setIsScrolledToTheBottom(false)
            return
        }

        setIsScrolledToTheBottom(true)

        const indexOfLastObjectInArray = listOfAllMessages.array.length-1

        if(parseInt(lastSeenMessageId.backend) >= parseInt(listOfAllMessages.array[indexOfLastObjectInArray].id)) return

        setLastSeenMessageId({...lastSeenMessageId, backend: listOfAllMessages.array[indexOfLastObjectInArray].id})

        const { signal } = channelInfo.controller
        fetch(urlOfMarkingLastMessageSeenInChannel+channelInfo.channelId+`?message_id=${listOfAllMessages.array[indexOfLastObjectInArray].id}`,{
            method: "PATCH",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})

        .then(response => response.json())
        .then(response => {
            if("error" in response) console.log(response)
        })
        .catch(error=>{console.log(error)})
        
      };


    const clickedDescendantOfToolbar = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>): void => {
        let toolbar = document.getElementById('toolbar');
        var clickedElement = e.relatedTarget
        if(toolbar!==null && !toolbar.contains(clickedElement)) {
            setIsToolbarVisible(false)
        }
    } 

    const showBBCodeEditor = (idOfElement: string): void => {
        let selection = window.getSelection()
        if(selection===null) {
            setIsToolbarVisible(false) 
            return
        }
        let selectedText: string = selection.toString()
        if(selectedText===""){
            setIsToolbarVisible(false) 
            return
        }
        
        let toolbar = document.getElementById("toolbar")
        if(!toolbar) return
       
        let textArea = document.getElementById(idOfElement)
        if(!textArea) return
        setTextAreaModified(textArea)
        let rect = textArea.getBoundingClientRect();
        toolbar.style.top = rect.top - 42 + 'px'
        toolbar.style.left = ( rect.left + (rect.width * 0.5)) + 'px'
        setIsToolbarVisible(true) 
    }
 
    return (
        <Grid sx={MessageBoxStyle}  container component={Paper} >
            <Grid  item xs={9}>
                <Box onScroll={(e)=>scrollCheck(e)} sx={boxHeight} >
                    {!areMessageFetched?
                        <SkeletonMessages></SkeletonMessages>
                        :listOfAllMessages.array.length>0 ? 
                            <AutoSizer >
                                {({ height, width }) => (
                                    <div onScrollCapture={(e)=>scrollCheck(e)} >
                                        <VariableSizeList 
                                            height={height}
                                            width={width}
                                            estimatedItemSize={64}
                                            itemSize={getRowHeight}
                                            ref={handleRect}
                                            itemCount={listOfAllMessages.array.length}
                                            overscanCount={7}
                                            innerElementType={innerElementType}
                                            itemData={{messageEdited, setMessageEdited,listOfAllMessages: listOfAllMessages.array, clickedDescendantOfToolbar, 
                                                setRowHeight, lastSeenMessageId, messageHoveredId, setDeleteMessageModalInfo, setMessageHoveredId, 
                                                showBBCodeEditor, setTextAreaModified, messageEditedId, setMessageEditedId, handleContextMenu
                                            }}
                                        >
                                            {DisplayMessage}
                                        </VariableSizeList>
                                    </div>
                                )}
                            </AutoSizer>
                            :<Grid sx={newConversationStyle}>Start conversation in this channel</Grid>}
                    </Box>
                <Divider />
                <Grid container style={{padding: '20px'}}>
                    <ToolBar isToolbarVisible={isToolbarVisible} textModifiedByToolbarInfo={textModifiedByToolbarInfo} setMessage={textAreaModified?.id ==="Message-Area"? setMessage: setMessageEdited}
                        setTextModifiedByToolbarInfo={setTextModifiedByToolbarInfo} textAreaToModified={textAreaModified}></ToolBar>
                        
                    <Grid item xs={11}>
                        <TextArea setMessage={setMessage} message={message} showBBCodeEditor={showBBCodeEditor} clickedDescendantOfToolbar={clickedDescendantOfToolbar}></TextArea>
                    </Grid>     
                </Grid>
            </Grid>
            <DeleteMessageModal isModalOpen={deleteMessageModalInfo.isModalOpen} controller={channelInfo.controller} 
                setIsModalOpen={setDeleteMessageModalInfo} idOfDeletedMessage={deleteMessageModalInfo.idOfDeletedMessage}></DeleteMessageModal>
            {userInContextMenu!==undefined?
                <UserContextMenu user={userInContextMenu} contextMenu={contextMenu} handleClose={setContextMenu}/>
                :
                null
            }
        </Grid>
    );
}

export default MessageBox;