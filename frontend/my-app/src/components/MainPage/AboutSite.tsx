import { Grid } from "@mui/material";
import Oliphant from "../../Oliphant.png"
import { SxProps } from "@mui/system";

const ChatRoomStyle: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: "4.5rem",
    
}

const heroIntro: SxProps = {
    width: "40%",
    minWidth: "400px",
    padding: "2em",
    paddingTop: "min(5vh, 4rem)",
    position: "relative",
    
    '&::after': {
        content: '""',
        inset: 0,
        position: "absolute",
        zIndex: -1,
        background: "gray",
        mixBlendMode: "multiply",
    }
}

const hero: SxProps = {
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundRepeat:"no-repeat",
    backgroundPosition:"center",
    zIndex: 1,
    color: "white",
    backgroundImage: `url(${Oliphant})`,
    
}


const AboutSite = (): JSX.Element => {

    return(
        <Grid sx={ChatRoomStyle} container>
            <Grid sx={hero}>
                <Grid  sx={heroIntro}>
                    <p>
                        Oliphant is message app, inspirited by Discord. You are probably gonna ask, why it's called oliphant. 
                        There is very simple explanation to this, in ancient India, people used elephants to send messages between cities, 
                        just like mail pigeons. Is this truth? yes, maybe, no...
                    </p>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AboutSite;