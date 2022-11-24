import './App.css';
// mui imports
import { AlertColor } from '@mui/material';
import { Routes, Route} from "react-router-dom";
// component imports
import Navbar from './components/MainPage/NavBar';
import Authorization from './components/Login/Authorization';
import ChatRoom from './components/ChatRoom/ChatRoom';
import UserProvider from './UserContext';
import SnackbarProvider from './SnackBarContext';
import Profile from './components/User/Profile';
import SnackBars from './components/MainPage/SnackBars';
import FriendBar from './components/User/FriendBar';
import PrivateRoute from './components/User/PrivateRoute';
// hooks imports
import { useState, useEffect } from 'react';
import Sidebar from './components/User/Sidebar';
import Box from '@material-ui/core/Box';
import AboutSite from './components/MainPage/AboutSite';

export const SNACKBAR_MESSAGES = {
  "Sign up success": { text:"Sign up successfully", severity: "success" as AlertColor},
  "Sign up unsuccess": { text: "Unable to Sign up successfully", severity: "error" as AlertColor},
  "Login success": { text: "Log in successfully", severity: "success" as AlertColor},
  "Login unsuccess": { text: "Unable to Login", severity: "error" as AlertColor}
}



function App() {
  

  const [showModal, setShowModal] = useState(false)
  const [currentModalOpenIsLogin, setCurrentModalOpenIsLogin] = useState(false)

  useEffect(() => {
      if(showModal===false){
        setCurrentModalOpenIsLogin(true)
      }
  }, [showModal]);
  
  useEffect(() => {
    let themeMode: string|null = localStorage.getItem("theme mode")
    if(themeMode === "dark" || themeMode === null ) document.body.classList.toggle('dark')
  
  }, []);

  return (
    <div >
      <SnackbarProvider>
        <UserProvider>
          <Navbar setShowModal={setShowModal} showModal={showModal}></Navbar>
          <Authorization showModal={showModal} setShowModal={setShowModal} setIsLoginModalOpen={setCurrentModalOpenIsLogin} 
              isLoginModalOpen={currentModalOpenIsLogin}></Authorization>
          <div>
            <Box sx={{ display: 'flex',  height: "100vh" }}>
              <Sidebar/>            
              <Routes>
                <Route path="/" element={
                    <>
                      <FriendBar></FriendBar>
                      <AboutSite></AboutSite>
                    </>
                  }
                />
               
                <Route path="/channel" element={<PrivateRoute/>}>
                  <Route path="/channel" element={<ChatRoom/>}/>
                </Route>
                <Route path="/profile" element={<PrivateRoute/>}>
                  <Route path="/profile" element={<Profile/>}/>
                </Route>
              </Routes>
            </Box>          
          </div>
          <SnackBars></SnackBars>
        </UserProvider>
      </SnackbarProvider>
      
    </div>
  );
}

export default App;
