import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Polling from "./pages/Polling";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Logout from "./components/Logout";
import UserNotVerified from "./pages/UserNotVerified";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";

function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <BrowserRouter>
          <Routes>
            {/* <Elements stripe={stripePromise}> */}
            <Route
              index
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/polling"
              element={
                <ProtectedRoute>
                  <Polling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="/user-not-verified" element={<UserNotVerified />} />
            {/* </Elements> */}
          </Routes>
        </BrowserRouter>
      </AnimatePresence>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#000",
          color: "#ffffff",
        }}
      />
    </>
  );
}

export default App;
