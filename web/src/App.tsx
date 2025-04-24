import { useEffect, useState } from "react";
import "./App.css";
import { Register } from "./components/register";
import { Login } from "./components/login";
import { NavBar } from "./components/navbar";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  Circuit,
  Route as RouteType,
  Climb,
  Projects,
  Set,
} from "./types/routes";
import { AdminPage } from "./components/admin";
import { RoutesPage } from "./components/routespage";
import { RoutePage } from "./components/routepage";
import { API } from "./types/api";
import Settings from "./components/settings";
import { RouteSettingPage } from "./components/route-setting";
import Profile from "./components/profile";
import Feed from "./components/feedpage";
import StorePage from "./components/store";
import NavBarBottom from "./components/navbar-bottom";
import { useUser } from "./lib/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Notifications } from "./components/ui/notifications";
const ProtectedRoute = ({ authed, children }) => {
  if (!authed) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const user = useUser();
  const [projects, setProjects] = useState<Projects>([]);

  function fetchProjects() {
    API("GET", "/api/projects/me/get_all")
      .then((data) => {
        setProjects(data.data);
        console.log("projects main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }

  function updateData() {
    fetchProjects();
  }

  // On component mount: Check if user logged in, if so load their achievements
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools />}
      <Notifications />
      <NavBar />
      <NavBarBottom user={user} />
      <Routes>
        <Route
          path="/register"
          element={
            <ProtectedRoute authed={!user.data}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authed={!user.data}>
              <Login />
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

        <Route
          path="/profile/:id"
          element={
            <Profile projects={projects} user={user} updateData={updateData} />
          }
        />

        <Route path="/store" element={<StorePage />} />

        <Route
          path="/profile/"
          element={
            <Profile projects={projects} user={user} updateData={updateData} />
          }
        />

        <Route
          path="/feed/"
          element={
            <Feed projects={projects} user={user} updateData={updateData} />
          }
        />

        <Route
          path="*"
          element={<RoutesPage projects={projects} updateData={updateData} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
