import { useStaffAuth } from './hooks/useStaffAuth';
import StaffLogin from './components/StaffLogin';
import StaffDashboard from './components/StaffDashboard';

export default function StaffApp() {
  const { isLoggedIn, staff, loading, error, login, logout } = useStaffAuth();

  if (!isLoggedIn) {
    return <StaffLogin loading={loading} error={error} onLogin={login} />;
  }

  return <StaffDashboard staff={staff} onLogout={logout} />;
}
