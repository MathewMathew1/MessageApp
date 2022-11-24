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

const SuccessLabelStyle: SxProps = {
  color: "rgb(118, 227, 147)",
  '&:hover': {
    backgroundColor: "green",
    color: "white"
  }
}



export{MenuStyle, WarningLabelStyle, SuccessLabelStyle}