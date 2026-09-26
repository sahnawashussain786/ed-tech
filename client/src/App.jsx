import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Spinner from './components/Spinner.jsx'
import Home from './pages/Home.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Checkout from './pages/Checkout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Learn from './pages/Learn.jsx'
import Studio from './pages/Studio.jsx'
import CourseEditor from './pages/CourseEditor.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

function FullLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ScrollToTop />
        {children}
      </main>
      <Footer />
    </div>
  )
}

function BareLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <ScrollToTop />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Immersive learning player (no navbar/footer) */}
          <Route
            path="/learn/:courseId"
            element={
              <BareLayout>
                <Learn />
              </BareLayout>
            }
          />

          {/* Full site layout */}
          <Route
            path="/"
            element={
              <FullLayout>
                <Home />
              </FullLayout>
            }
          />
          <Route
            path="/courses"
            element={
              <FullLayout>
                <Courses />
              </FullLayout>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <FullLayout>
                <CourseDetail />
              </FullLayout>
            }
          />
          <Route
            path="/checkout/:courseId"
            element={
              <ProtectedRoute>
                <FullLayout>
                  <Checkout />
                </FullLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FullLayout>
                  <Dashboard />
                </FullLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio"
            element={
              <ProtectedRoute requireInstructor>
                <FullLayout>
                  <Studio />
                </FullLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/courses/new"
            element={
              <ProtectedRoute requireInstructor>
                <FullLayout>
                  <CourseEditor />
                </FullLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/courses/:id/edit"
            element={
              <ProtectedRoute requireInstructor>
                <FullLayout>
                  <CourseEditor />
                </FullLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <FullLayout>
                  <Profile />
                </FullLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <FullLayout>
                <Login />
              </FullLayout>
            }
          />
          <Route
            path="/register"
            element={
              <FullLayout>
                <Register />
              </FullLayout>
            }
          />
          <Route
            path="*"
            element={
              <FullLayout>
                <NotFound />
              </FullLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Re-export for convenience
export { Spinner }
