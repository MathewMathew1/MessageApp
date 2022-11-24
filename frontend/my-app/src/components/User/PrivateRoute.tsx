
import { Navigate, Outlet } from "react-router"
import { useUser } from "../../UserContext"

  
const PrivateRoute = () => {
    const user = useUser()
    const auth = user.logged || !user.fetchingUserDataFinished; // determine if authorized, from context or however you're doing it

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return auth ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoute
