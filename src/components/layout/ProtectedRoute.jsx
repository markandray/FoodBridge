import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({
  children,
  requiredRole, 
}) => {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const correctDashboard =
      role === ROLES.RESTAURANT
        ? ROUTES.RESTAURANT_DASHBOARD
        : ROUTES.NGO_DASHBOARD;

    return <Navigate to={correctDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;