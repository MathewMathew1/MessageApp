
import { Route, Redirect } from "react-router"
import { useUser } from "../../UserContext"


const PrivateRoute = ({component: Component,  ...rest}) => {
    const user = useUser()
    
    return (
      <Route
        {...rest}
        render={(props) => !user.logged && user.fetchingUserDataFinished 
          ? <Redirect to={{pathname: '/', state: {from: props.location}}} /> 
          : <Component  {...props} />}
      />
    )
  }

export default PrivateRoute