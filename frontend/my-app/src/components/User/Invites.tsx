

import Menu from '@mui/material/Menu';
import { SxProps } from '@mui/system';
import FriendInvite from '../../Invites/FriendInvite';
import Invite from '../../Invites/Invite';
import { InviteEnum } from '../../types/types';
//HELPERS
import { useUser } from '../../UserContext';


const MenuStyle: SxProps = {
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    overflowY: "auto",
    width: "400px",
    maxHeight: "400px",
    mt: 1.5,
    '& .MuiAvatar-root': {
        width: 32,
        height: 32,
        ml: -0.5,
        mr: 1,
    },
    '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 14,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
      },
}

const FriendInvites = (): JSX.Element => {
    const user = useUser()

    return (
        <>
            {user.userFriendInvites.length === 0  ?(
                <div>
                    Currently you dont have any friend requests
                </div>
            ):(
                <div>
                    {user.userFriendInvites.map((value, index) => {
                        return(
                            <FriendInvite keyId={index} invite={value} key={index}></FriendInvite>
                        )
                    })}
                </div>
            )}
        </>
    )
}

const ChannelInvites = (): JSX.Element => {
    const user = useUser()

    return (
        <>
            {user.userInvites.length === 0  ?(
                <div>
                    Currently you dont have any invites
                </div>
            ):(
                <div>
                    {user.userInvites.map((value, index) => {
                        return(
                            <Invite keyId={index} invite={value} key={index}></Invite>
                        )
                    })}
                </div>
            )}
        </>
    )
}

const InvitesList = ({isOpen, setShowList, anchorEl, inviteType}: 
    {isOpen: boolean, setShowList: Function, anchorEl: Element|undefined, inviteType: InviteEnum}): JSX.Element => {

    return(
        <div>
            <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={() =>setShowList(false)}
                PaperProps={{
                    elevation: 0,
                    sx: MenuStyle
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
            {inviteType==="friend"? 
                <FriendInvites/>
                :
                <ChannelInvites/>
            }
            </Menu>
        </div>
    )
}

export default InvitesList;