import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Register } from './components/register'
import { Login } from './components/login'
import { checkAuth } from './providers/AuthProvider'
import LogoutButton from './components/logout'
import { NavBar } from './components/navbar'
import { BrowserRouter, createBrowserRouter, Navigate, Route, RouterProvider, Routes } from 'react-router'
import { Circuit, Route as RouteType } from './types/routes'
import { RouteList } from './components/route-list'
import { AdminPage } from './components/admin'
import { RoutesPage } from './components/routespage'
import { RoutePage } from './components/routepage'
import { API } from './types/api'

const ProtectedRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// const router = (user:any) => createBrowserRouter([
//   {
//     path: "/register",
//     element: <ProtectedRoute user={user}>
//               <Register/>
//           </ProtectedRoute>,
//   },
//   {
//     path: "/login",
//     element: <ProtectedRoute user={user}>
//                 <Login/>
//             </ProtectedRoute>,
//   },
//   {
//     path: "/admin",
//     element: <ProtectedRoute user={user != false}>
//                 <AdminPage/>
//             </ProtectedRoute>,
//   },
//   {
//     path: "/route/:id",
//     element: <RoutePage/>
//   },
//   {
//     path: "*",
//     element: <RoutesPage />,
//   },
// ]);

function App() {

  const [user, setLoggedIn] = useState(false);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [climbs, setClimbs] = useState<any[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);

  function fetchClimbs(){
      API("GET", "/api/climbs/me/get_all").then((data) => {
        setClimbs(data.data);
        console.log("climbs main",data.data)
      }).catch((error) => {
        console.error('Error fetching climbs:', error);
      })
  }

  function fetchRoutes(){
    API("GET", "/api/routes/get_all").then((data) => {
      setRoutes(data.data);
      console.log("route main",data.data)
    }).catch((error) => {
      console.error('Error fetching route:', error);
    })
  }

  function fetchCircuits(){
    API("GET", "/api/circuits/get_all").then((data) => {
      setCircuits(data.data);
      console.log("circuit main",data.data)
    }).catch((error) => {
      console.error('Error fetching circuit:', error);
    })
  }

  function updateData(){
    fetchClimbs();
    fetchRoutes();
    fetchCircuits();
  }

  

    // On component mount: Check if user logged in, if so load their achievements
    useEffect(() => {
      fetchClimbs();
      fetchRoutes();
      fetchCircuits();
      checkAuth().then(user_ => {
        setLoggedIn(user_);
        console.log("user log:",user_)
      })
    }, []);

  return (
    // <>
    //   <NavBar user={user}></NavBar>
    //   <RouterProvider router={router(user)} />
    // </>

<BrowserRouter>
<NavBar user={user}></NavBar>
<Routes>
  <Route path="/register" element={<ProtectedRoute user={user}><Register /></ProtectedRoute>} />
  <Route path="/login" element={<ProtectedRoute user={user}><Login /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute user={user != false}><AdminPage /></ProtectedRoute>} />
  <Route path="/route/:id" element={<RoutePage routes={routes} circuits ={circuits} climbs={climbs} updateData={updateData} />} />
  <Route path="*" element={<RoutesPage routes={routes} circuits ={circuits} climbs={climbs} updateData={updateData} />} />
</Routes>
</BrowserRouter>
  )
}

export default App
