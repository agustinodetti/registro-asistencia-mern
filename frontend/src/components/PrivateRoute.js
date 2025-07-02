import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const PrivateRoute = ({ allowedRoles }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const userRole = getUserRole();
    if (!allowedRoles.includes(userRole)) {
      navigate('/unauthorized');
    }
  }, [navigate, allowedRoles]);

  return isAuthenticated() ? <Outlet /> : null;
};

export default PrivateRoute;