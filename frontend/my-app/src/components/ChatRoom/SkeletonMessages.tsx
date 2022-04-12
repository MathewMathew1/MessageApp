import { Skeleton, Stack } from "@mui/material"

const SkeletonMessages = (): JSX.Element => {
    return(
        <Stack sx={{marginLeft: "1rem"}} spacing={1}>
            
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={"80%"} height={118} />

            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={"80%"} height={50} />
            <Skeleton variant="rectangular" width={"70%"} height={20} />

            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={"50%"} height={20} />
            <Skeleton variant="rectangular" width={"40%"} height={20} />
        </Stack>
    )
}

export default SkeletonMessages