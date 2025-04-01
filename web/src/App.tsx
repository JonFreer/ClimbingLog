import { useEffect, useState } from "react";
import "./App.css";
import { Register } from "./components/register";
import { Login } from "./components/login";
import { checkAuth } from "./providers/AuthProvider";
import { NavBar } from "./components/navbar";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  Circuit,
  Route as RouteType,
  User,
  Climb,
  Projects,
  Set,
} from "./types/routes";
import { AdminPage } from "./components/admin";
import { RoutesPage } from "./components/routespage";
import { RoutePage } from "./components/routepage";
import { API } from "./types/api";
import Settings from "./components/settings";
import DraggableDotsCanvas from "./components/map";
import { RouteSettingPage } from "./components/route-setting";
import Profile from "./components/profile";
import Feed from "./components/feedpage";
import StorePage from "./components/store";
import NavBarBottom from "./components/navbar-bottom";

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
  const [circuits, setCircuits] = useState<Record<string, Circuit>>({});
  const [projects, setProjects] = useState<Projects>([]);
  const [sets, setSets] = useState<Record<string, Set>>({});

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
        const circuits_dict = data.data.reduce(
          (acc: Record<string, Circuit>, circuit: Circuit) => {
            acc[circuit.id] = circuit;
            return acc;
          },
          {}
        );
        console.log("circuits_dict", circuits_dict);
        setCircuits(circuits_dict);
        console.log("circuit main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching circuit:", error);
      });
  }

  function fetchSets() {
    API("GET", "/api/sets/get_all")
      .then((data) => {
        const setsDict = data.data.reduce(
          (acc: Record<string, Set>, set: Set) => {
            acc[set.id] = set;
            return acc;
          },
          {}
        );
        setSets(setsDict);
        console.log("sets main", data.data);
      })
      .catch((error) => {
        console.error("Error fetching set:", error);
      });
  }

  function updateData() {
    fetchClimbs();
    fetchRoutes();
    fetchCircuits();
    fetchProjects();
    fetchSets();
  }

  // On component mount: Check if user logged in, if so load their achievements
  useEffect(() => {
    fetchClimbs();
    fetchRoutes();
    fetchCircuits();
    fetchProjects();
    fetchSets();
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
      <NavBarBottom user={user} />
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
          path="/route_setting"
          element={
            <ProtectedRoute authed={user && user.route_setter}>
              <RouteSettingPage />
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
          path="/profile/:id"
          element={
            <Profile
              routes={routes}
              circuits={circuits}
              sets={sets}
              climbs={climbs}
              projects={projects}
              user={user}
              updateData={updateData}
            />
          }
        />

        <Route path="/store" element={<StorePage />} />

        <Route
          path="/profile/"
          element={
            <Profile
              routes={routes}
              circuits={circuits}
              sets={sets}
              climbs={climbs}
              projects={projects}
              user={user}
              updateData={updateData}
            />
          }
        />

        <Route
          path="/feed/"
          element={
            <Feed
              routes={routes}
              circuits={circuits}
              sets={sets}
              climbs={climbs}
              projects={projects}
              user={user}
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
              sets={sets}
              climbs={climbs}
              projects={projects}
              updateData={updateData}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
