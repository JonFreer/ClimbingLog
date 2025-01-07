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
import { Route as RouteType } from './types/routes'
import { RouteList } from './components/route-list'
import { AdminPage } from './components/admin'
import { RoutesPage } from './components/routespage'
import { RoutePage } from './components/routepage'

const ProtectedRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = (user:any) => createBrowserRouter([
  {
    path: "/register",
    element: <ProtectedRoute user={user}>
              <Register/>
          </ProtectedRoute>,
  },
  {
    path: "/login",
    element: <ProtectedRoute user={user}>
                <Login/>
            </ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute user={user != false}>
                <AdminPage/>
            </ProtectedRoute>,
  },
  {
    path: "/route/:id",
    element: <RoutePage/>
  },
  {
    path: "*",
    element: <RoutesPage />,
  },
]);

function App() {
  const [user, setLoggedIn] = useState(false);


    // On component mount: Check if user logged in, if so load their achievements
    useEffect(() => {
      checkAuth().then(user_ => {
        setLoggedIn(user_);
        console.log(user_)
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
  <Route path="/route/:id" element={<RoutePage />} />
  <Route path="*" element={<RoutesPage />} />
</Routes>
</BrowserRouter>
  )
}

export default App
