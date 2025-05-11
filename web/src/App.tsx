import "./App.css";
import { NavBar } from "./components/ui/navbars/navbar";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { User } from "./types/routes";
import { AdminPage } from "./components/admin";
import { RoutesPage } from "./components/routespage";
import Settings from "./components/settings";
import { RouteSettingPage } from "./components/route-setting";
import Profile from "./components/profile";
import Feed from "./components/feedpage";
import StorePage from "./components/store";
import NavBarBottom from "./components/ui/navbars/navbar-bottom";
import { useUser } from "./lib/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Notifications, useNotifications } from "./components/ui/notifications";
import RouteSideBar from "./components/ui/sidebar/route-sidebar";
import { UserListModal } from "./components/ui/userlist/userlist";
import { LoginForm } from "./features/auth/components/login-form";
import { RegisterForm } from "./features/auth/components/register-form";
const ProtectedRoute = ({
  authed,
  children,
}: {
  authed: boolean | undefined | User;
  children: React.ReactNode;
}) => {
  if (!authed) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const user = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  return (
    <>
      {import.meta.env.DEV && <ReactQueryDevtools />}
      <Notifications />
      <NavBar />
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
                  navigate("/login");
                  addNotification({
                    type: "success",
                    title: "Registration Successful",
                    message: "You can now log in.",
                  });
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authed={!user.data}>
              <LoginForm onSuccess={() => {}} />
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute authed={user.data && user.data.is_superuser}>
              <AdminPage />
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

        <Route path="/store" element={<StorePage />} />

        <Route path="/profile/" element={<Profile />} />

        <Route path="/feed/" element={<Feed />} />

        <Route path="*" element={<RoutesPage />} />
      </Routes>
    </>
  );
}

export default App;
