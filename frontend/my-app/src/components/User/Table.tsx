import { Button, ButtonGroup, TableHead, TableRow, TableBody, TableCell, Table, TableContainer } from '@mui/material';
//types
import { UserInvites } from '../../types/types';
import { SxProps } from '@mui/system';
import { useUpdateSnackbar } from '../../SnackBarContext';
import { urlOfInvitesSent, urlOfRespondingToInvite } from '../../apiRoutes';
import useArray from '../../customHooks/useArray';
import { useEffect } from 'react';

const TableStyle: SxProps = {
    backgroundColor: "var(--background-color2)",
    padding: "1rem",
    justifyContent: "center",
    alignItems: "center",

    ' > *': {
        color: "var(--text-color) !important",
        marginTop: "0.5rem"
    }
}


const tableListItemStyle: SxProps = {
    ' > *': {
        color: "var(--text-color) !important",
    }
}

const tableHeadItemStyle: SxProps = {
    ' > *': {
        backgroundColor: "var(--background-color) !important",
        color: "var(--text-color) !important",
    }
}

const TableInvites = (): JSX.Element => {
    const invites = useArray<UserInvites>([])
    const updateSnackbar = useUpdateSnackbar()
    const controller = new AbortController()

    const deleteInvite = (id: string): void => {
        const { signal } = controller
        fetch(urlOfRespondingToInvite+id,{
            method: "Delete",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
        .then(response => response.json())
        .then(response => {
            if(!response.error){
                invites.removeByKey("id", id)
                updateSnackbar.addSnackBar({snackbarText: "Invite deleted", severity: "success"})
                return
            }
            updateSnackbar.addSnackBar({snackbarText: "Unable to delete invite", severity: "error"})
            console.log(response)
        })
        .catch(error=>{console.log(error)})
    }

    useEffect(() => {
        
        const fetchUserInvites = (): void => {
            if(!localStorage.getItem("token")) return
            
            const { signal } = controller
            fetch(urlOfInvitesSent,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': "Bearer " + localStorage.getItem("token") || ""
                }})
    
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)){
                    console.log(response)
                    invites.set(response.invites)
                }
            })
            .catch(error=>{console.log(error)})    
        }

        fetchUserInvites()

        return () => {
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {invites.array.length >0 
                ?<TableContainer sx={{ maxHeight: 340 }}>
                    <Table sx={TableStyle} stickyHeader >
                        <TableHead>
                            <TableRow sx={tableHeadItemStyle}>
                                <TableCell>
                                    User invited
                                </TableCell>
                                <TableCell>
                                    Channel
                                </TableCell>
                                <TableCell>
                                    Delete invite
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {invites.array.map((value, index) => {
                                return(
                                    <TableRow sx={tableListItemStyle}  key={`${index} invite`} tabIndex={-1}>
                                        <TableCell >{value.username}</TableCell>
                                        <TableCell>{value.channel_name}</TableCell>
                                        <TableCell>
                                            <ButtonGroup variant="contained" aria-label="outlined primary button group" >
                                                <Button onClick={()=>deleteInvite(value.id)} color='error' > Delete</Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                :<div>So far you haven't invite anyone</div>
            }
        </>
    )
}

export default TableInvites