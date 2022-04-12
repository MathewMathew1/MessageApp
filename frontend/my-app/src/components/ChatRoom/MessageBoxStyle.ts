import { SxProps } from "@mui/system"

const MessageBoxStyle: SxProps = {
    display: "flex",
    margin: "auto",
    justifyContent: "center",
    maxWidth: "1000px",
    color: "var(--text-color)",
    backgroundColor: "var(--background-color1)",
    height: "100%",
    overflowX: "auto",
    
}

const MessageBoxListItemStyle: SxProps = {
    paddingTop: "0px", 
    paddingBottom: "0px",
    paddingRight: "0.9rem",
    '&:hover': {
        background: "var(--theme-hovered)",
    }
}

const boxHeight: SxProps = {
    
    height: "450px",
    wordWrap: "break-word",

}

const EmojiBox: SxProps = {
    marginRight: "0.15rem",
    marginTop: "0rem",
    display: "inline-block",
    transform: "scale(0.85)",
    backgroundColor: "var(--background-color2)",
    userSelect: "none",
    border: "solid var(--background-color2)",
    borderRadius: "5px",
    '&:hover': {
       
        borderColor: "red",
    }
}

const ContainerForTextFieldStyle: SxProps = {
    p: '2px 4px', 
    display: 'flex', 
    
    width: "100%",
    backgroundColor: "var(--background-color2) !important",
    '> *': {
        backgroundColor: "var(--background-color2) !important",
        color: "var(--text-color) !important",
    }
}

const emojiPickerStyle: SxProps = {
    position: "absolute",
    zIndex: "11",
   
    transform: "translateY(-100%)",
    
    'input': {
        backgroundColor: "var(--background-color2) !important",
        color: "var(--text-color) !important",
    },
    'ul:before': {
        backgroundColor: "var(--background-color2) !important",
   
    },
    '> *': {
        backgroundColor: "var(--background-color) !important",
        color: "var(--text-color) !important",
    },
    
}






export {MessageBoxStyle, MessageBoxListItemStyle, emojiPickerStyle, ContainerForTextFieldStyle, EmojiBox, boxHeight}