import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from './utils/authClient.js';

function ProtectedRoute({ children }) {
    const location = useLocation();
    const token = getAccessToken();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
