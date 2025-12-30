import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { usePermissions, type Role, type Permissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: Role[];
	require?: keyof Permissions;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, require }) => {
	const { isAuthenticated, isLoading, user } = useAuth();
	const location = useLocation();
	const perms = usePermissions();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<LoadingSpinner size="lg" text="A verificar autenticação..." />
			</div>
		);
	}

	if (!isAuthenticated) {
		// Guardar a localização tentada para redirecionar após login
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Role-based guard if specified
	if (allowedRoles && allowedRoles.length > 0) {
		const userRole = (user?.user_type as Role) || 'voter';
		const isAllowed = allowedRoles.includes(userRole);
		if (!isAllowed) {
			return <Navigate to="/forbidden" replace />;
		}
	}

	// Permission flag guard if specified
	if (require) {
		const hasPermission = Boolean(perms[require]);
		if (!hasPermission) {
			return <Navigate to="/forbidden" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
