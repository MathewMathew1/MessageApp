import { Alert, Snackbar } from "@mui/material";
//HELPERS
import { useSnackbar, useUpdateSnackbar } from "../../SnackBarContext";
//TYPES
import { SnackbarInfo } from "../../SnackBarContext";


const SnackBars = (): JSX.Element => {
    const snackBars = useSnackbar()
    const snackBarUpdate = useUpdateSnackbar()

    const handleClose = (reason: string, index: number): void => {
        if (reason === 'clickaway') return

        snackBarUpdate.removeSnackBarByIndex(index)
    }

    return(
        <>
            {snackBars.snackBarsInfos.map((snackbar: SnackbarInfo, index: number)=> (
                <Snackbar sx={{marginBottom: 8*index }} anchorOrigin={{horizontal: "right", vertical: "bottom"}} open={true} key={`${index}snackbar`} 
                    autoHideDuration={5000} onClose={(_e, reason) => handleClose(reason, index)}>
                    <Alert variant="filled" onClose={(_e) => handleClose('reason', index)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            ))}
        </>
    )
}

export default SnackBars;