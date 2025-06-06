import { NavBar } from './components/ui/navbars/navbar';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { User } from './types/routes';
import { AdminPage } from './components/admin';
import { RoutesPage } from './components/routespage';
import Settings from './components/settings';
import { RouteSettingPage } from './components/route-setting';
import Profile from './components/profile';
import Feed from './components/feedpage';
import StorePage from './components/store';
import NavBarBottom from './components/ui/navbars/navbar-bottom';
import { useUser } from './lib/auth';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  BasicNotification,
  Notifications,
  useNotifications,
} from './components/ui/notifications';
import RouteSideBar from './components/ui/sidebar/route-sidebar';
import { UserListModal } from './components/ui/userlist/userlist';
import { LoginForm } from './features/auth/components/login-form';
import { RegisterForm } from './features/auth/components/register-form';
import { VerifyPage, VerifyPrompt } from './features/auth/components/verify';
import Onboarding from './features/onboarding/components/onboarding';
import { useJustRegistered } from './features/auth/hooks/just-registered';
import { RequestPasswordReset } from './features/auth/components/request-password-reset';
import { PasswordResetForm } from './features/auth/components/password-reset-form';
import 'material-symbols/rounded.css';
import { GymsPage } from './pages/gyms';
import CreateGym from './pages/create-gym';

const ProtectedRoute = ({
  authed,
  children,
}: {
  authed: null | undefined | User | boolean;
  children: React.ReactNode;
}) => {
  if (
    authed === null ||
    authed === undefined ||
    (typeof authed === 'boolean' && !authed)
  ) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const user = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { setJustRegistered, justRegistered } = useJustRegistered();

  return (
    <div className="bg-gray-50">
      {import.meta.env.DEV && <ReactQueryDevtools />}
      <Notifications />
      <NavBar />
      <VerifyPrompt />
      <NavBarBottom />
      <RouteSideBar />
      <UserListModal />
      <Routes>
        <Route
          path="/register"
          element={
            <ProtectedRoute authed={!user.data}>
              <RegisterForm
                onSuccess={() => {
                  navigate('/login');
                  setJustRegistered();
                  addNotification({
                    type: 'success',
                    title: 'Registration Successful',
                    message: 'You can now log in.',
                  } as BasicNotification);
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authed={!user.data}>
              <LoginForm
                onSuccess={() => {
                  console.log('Login successful', justRegistered);
                  if (justRegistered) {
                    console.log('Navigating to onboarding');
                    setTimeout(() => navigate('/welcome'), 0);
                  }
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-password-reset"
          element={
            <ProtectedRoute authed={!user.data}>
              <RequestPasswordReset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset_password/:token"
          element={
            <ProtectedRoute authed={!user.data}>
              <PasswordResetForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute authed={user.data}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/welcome" element={<Onboarding />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute authed={user.data && user.data.is_superuser}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gyms"
          element={
            <ProtectedRoute authed={user.data && user.data.is_superuser}>
              <GymsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create_gym"
          element={
            <ProtectedRoute authed={user.data && user.data.is_superuser}>
              <CreateGym />
            </ProtectedRoute>
          }
        />

        <Route
          path="/route_setting"
          element={
            <ProtectedRoute authed={user.data && user.data.route_setter}>
              <RouteSettingPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/route/:id"
          element={
            <RoutePage
              routes={routes}
              circuits={circuits}
              climbs={climbs}
              updateData={updateData}
            />
          }
        /> */}

        <Route path="/profile/:id" element={<Profile />} />

        <Route path="/verify/:token" element={<VerifyPage />} />

        <Route path="/store" element={<StorePage />} />

        <Route path="/profile/" element={<Profile />} />

        <Route path="/feed/" element={<Feed />} />

        <Route path="*" element={<RoutesPage />} />
      </Routes>
    </div>
  );
}

export default App;
