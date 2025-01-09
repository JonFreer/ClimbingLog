import { useEffect, useState } from "react";
import "./App.css";
import { Register } from "./components/register";
import { Login } from "./components/login";
import { checkAuth } from "./providers/AuthProvider";
import { NavBar } from "./components/navbar";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";
import { Circuit, Route as RouteType, User, Climb } from "./types/routes";
import { AdminPage } from "./components/admin";
import { RoutesPage } from "./components/routespage";
import { RoutePage } from "./components/routepage";
import { API } from "./types/api";
import Settings from "./components/settings";
import DraggableDotsCanvas from "./components/map";

const ProtectedRoute = ({ authed, children }) => {
  if (!authed) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [user, setLoggedIn] = useState<User | false>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : false;
  });
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);

  function fetchClimbs() {
    API("GET", "/api/climbs/me/get_all")
      .then((data) => {
        setClimbs(data.data);
        console.log("climbs main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching climbs:", error);
      });
  }

  function fetchRoutes() {
    API("GET", "/api/routes/get_all")
      .then((data) => {
        setRoutes(data.data);
        console.log("route main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching route:", error);
      });
  }

  function fetchCircuits() {
    API("GET", "/api/circuits/get_all")
      .then((data) => {
        setCircuits(data.data);
        console.log("circuit main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching circuit:", error);
      });
  }

  function updateData() {
    fetchClimbs();
    fetchRoutes();
    fetchCircuits();
  }

  // On component mount: Check if user logged in, if so load their achievements
  useEffect(() => {
    fetchClimbs();
    fetchRoutes();
    fetchCircuits();
    checkAuth()
      .then((user_) => {
        setLoggedIn(user_);
        console.log("user log:", user_);
        localStorage.setItem("user", JSON.stringify(user_));
      })
      .catch(() => {
        setLoggedIn(false);
        localStorage.removeItem("user");
      });
  }, []);

  return (
    <BrowserRouter>
      <NavBar user={user} />
      <Routes>
        <Route
          path="/register"
          element={
            <ProtectedRoute authed={user === false}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authed={user === false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute authed={user !== false}>
              <Settings user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute authed={user && user.is_superuser}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route/:id"
          element={
            <RoutePage
              routes={routes}
              circuits={circuits}
              climbs={climbs}
              updateData={updateData}
            />
          }
        />
        <Route
          path="*"
          element={
            <RoutesPage
              routes={routes}
              circuits={circuits}
              climbs={climbs}
              updateData={updateData}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
