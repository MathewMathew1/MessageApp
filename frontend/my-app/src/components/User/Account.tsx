
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Avatar, ClickAwayListener, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/Logout';
import Switch from '@mui/material/Switch';
//HELPERS
import { useUser, useUserUpdate } from '../../UserContext';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
//COMPONENTS
import AvatarComponent from './Avatar';




const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb:before': {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            '#fff',
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
      width: 32,
      height: 32,
      '&:before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      borderRadius: 20 / 2,
    },
  }));

const   Account = (): JSX.Element => {
    const[isListOpen, setIsListOpen] =  useState(false)
    const[themeMode, setThemeMode] = useState("dark")
    const listRef = useRef<any>({});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const user = useUser()
    const userUpdate = useUserUpdate()
    
    useEffect(() => {
        const themeMode: string|null = localStorage.getItem("theme mode")
        setThemeMode(themeMode===null? "dark": themeMode)
    }, []);
    

    const changeThemeMode = (e: React.ChangeEvent<HTMLInputElement>): void => {
        document.body.classList.toggle('dark')
        const newThemeMode = e.target.checked? "dark": "light"
        setThemeMode(newThemeMode)
        localStorage.setItem("theme mode", newThemeMode)
    }

    const handleClickAway = (e: MouseEvent | TouchEvent): void => {
        if(!listRef.current.contains(e.target)) setIsListOpen(false)
    }

    return(
        <>
          <div ref={listRef} onClick={(e)=>{handleClick(e); setIsListOpen(!isListOpen)}}>
              <AvatarComponent name={user.userInfo?.username || ""}></AvatarComponent>
          </div>
            {listRef.current?
            <ClickAwayListener onClickAway={(e)=>handleClickAway(e)}>
              <Menu
                  anchorEl={anchorEl}
                  open={isListOpen}
                  onClose={() => setIsListOpen(false)}
                  PaperProps={{
                  elevation: 0,
                  sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      bgcolor: 'var(--background-color)',
                      color: 'var(--text-color)',
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
                          bgcolor: 'var(--background-color)',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                      },
                  },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={Link} replace to={`/profile`}>
                    <Avatar /> Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem>
                    <FormControlLabel
                        control={<MaterialUISwitch onChange={(e)=>changeThemeMode(e)} 
                        sx={{ m: 1 }} checked={themeMode==="dark"} />}
                        label={`${themeMode} mode`}
                    />
                  </MenuItem>
                  <MenuItem onClick={()=> userUpdate.logout()}>
                      <ListItemIcon>
                          <Logout fontSize="small" />
                      </ListItemIcon>
                          Logout
                  </MenuItem>
              </Menu>
              </ClickAwayListener>
              : null
            }
          
        </>
    )
}

export default Account;