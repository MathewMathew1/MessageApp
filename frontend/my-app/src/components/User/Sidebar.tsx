import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Tooltip from '@mui/material/Tooltip'
import AddCircleIcon from '@mui/icons-material/AddCircle'
//HELPERS
import { useUser } from '../../UserContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
//COMPONENTS
import CreateChannelModal from '../ChatRoom/Modals/CreateChannelModal'
import AvatarComponent from './Avatar'
import ChannelContextMenu from "../ContextMenus/ChannelContextMenu"
//TYPES
import { CSSProperties } from 'react'
import { UserChannel, MenuPosition } from '../../types/types'

const DRAWER_HEIGHT = 80;

const lineStyled: CSSProperties = {
    opacity: "1",
    height: "2rem",
    transform: "none"
}

const line: CSSProperties = {
    position: "absolute",
    overflow: "hidden",
    width: "6px",
    height: "40px",
    display: "flex",
    alignItems: "left",
    justifyContent: "left",
    marginTop: "8px",
    background: "pink"
}

const Sidebar = (): JSX.Element => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [contextMenu, setContextMenu] = useState<MenuPosition>(null)
    const [channelInContextMenu, setChannelInContextMenu] = useState<UserChannel>()
    
    const user = useUser()

    const handleContextMenu = (event: React.MouseEvent, index: number) => {
        event.preventDefault();
        setChannelInContextMenu(user.userChannels[index])
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

    if(user.logged){
        return (
            <Drawer
                variant="permanent"
                sx={{
                width: DRAWER_HEIGHT,
                flexShrink: 0,
                '> *': {
                    backgroundColor: "var(--background-color2) !important",
                },
                [`& .MuiDrawer-paper`]: { width: DRAWER_HEIGHT, boxSizing: 'border-box' }
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                <Divider />
                <List>
                    {user.userChannels.map((channel, index) => (
                        <div key={index}>
                            {user.currentlyObservedChannel===channel.id?
                                <div style={line} className="pill-2RsI5Q wrapper-z5ab_q" ><span className="item-2LIpTv" style={lineStyled}></span></div>
                                :null
                            }
                            <Tooltip  title={channel.name} placement="right" >
                                <ListItem onContextMenu={(e)=>handleContextMenu(e, index)} button component={Link} replace to={`/channel?channelId=${channel.id}`}  >
                                    <ListItemIcon>
                                        <AvatarComponent name={channel.name}></AvatarComponent>
                                    </ListItemIcon>
                                </ListItem>
                            </Tooltip>
                        </div>
                    ))}    
                    <Tooltip title="Create channel" placement="right">
                        <ListItem onClick={()=>setIsModalOpen(true)} button >
                            <ListItemIcon>
                                <AddCircleIcon sx={{width: "40px", height: "40px"}}></AddCircleIcon>
                            </ListItemIcon>
                        </ListItem>
                    </Tooltip>
                </List>
                </Box>
                <CreateChannelModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}></CreateChannelModal>
                {channelInContextMenu!==undefined?
                    <ChannelContextMenu userChannel={channelInContextMenu}  contextMenu={contextMenu} handleClose={setContextMenu}></ChannelContextMenu>
                    :
                    null
                }
                </Drawer>
        )
    }
    else{
        return(
            <></>
        )
    }
}

export default Sidebar