import { SxProps } from "@mui/system"

const MenuStyle: SxProps = {
    "& .MuiPaper-root": {
      backgroundColor: "var(--background-color2) !important",
      color: "var(--text-color)"
    }
}

const WarningLabelStyle: SxProps = {
    color: "rgb(236, 49, 59)",
    '&:hover': {
      backgroundColor: "red",
      color: "white"
    }
}


export{MenuStyle, WarningLabelStyle}