import 'react-toastify/dist/ReactToastify.css';
import './styles/global.scss';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Menu from './components/menu/Menu';
import Home from './pages/home/Home';
import Devices from './pages/devices/Devices';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ScaleLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileUpdatePage from './pages/profileUpdatePage/ProfileUpdatePage';
import Users from './pages/users/Users';
import DeviceLocations from './pages/locationHistory/LocationHistory';
// import ThreeDRenderer from "./pages/threeTest/threeTest";

const override = {
  position: 'absolute',
  top: '0',
  left: '0',
  textAlign: 'center',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgb(0 0 0 / 30%)',
  zIndex: '9999'
};

const queryClient = new QueryClient();
function App() {
  const Layout = () => {
    const statusLoading = useSelector((state) => state.globalLoading.status);
    const { currentUser } = useContext(AuthContext);
    if (!currentUser) {
      return <Navigate to="/" />;
    } else {
      return (
        <div className="main">
          <Navbar />
          <div className="container">
            <div className="menuContainer">
              <Menu />
            </div>
            <div className="contentContainer">
              <QueryClientProvider client={queryClient}>
                <ScaleLoader loading={statusLoading} cssOverride={override} color="#36d7b7" />
                <Outlet />
                <ToastContainer />
              </QueryClientProvider>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  };

  const NavBarLayout = () => {
    const statusLoading = useSelector((state) => state.globalLoading.status);
    return (
      <div className="main">
        <Navbar />
        <div className="container">
          <div className="contentContainer">
            <QueryClientProvider client={queryClient}>
              <ScaleLoader loading={statusLoading} cssOverride={override} color="#36d7b7" />
              <Outlet />
              <ToastContainer />
            </QueryClientProvider>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <NavBarLayout />,
      children: [
        {
          path: '/',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/home',
          element: <Home />
        },
        {
          path: '/devices',
          element: <Devices />
        },
        {
          path: '/users',
          element: <Users />
        },
        {
          path: '/profile',
          element: <ProfilePage />
        },
        {
          path: '/profile/update',
          element: <ProfileUpdatePage />
        },
        {
          path: '/location-history',
          element: <DeviceLocations />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
