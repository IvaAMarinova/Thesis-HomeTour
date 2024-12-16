import { Navigate, Outlet } from 'react-router-dom';

type UserType = "b2b" | "b2c";

interface PrivateRouteProps {
    isLoggedIn: boolean;
    allowedRoles?: string[];
    userRole?: UserType | null;
}

export function PrivateRoute(props: PrivateRouteProps): JSX.Element {
    const { isLoggedIn, allowedRoles, userRole } = props;

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}