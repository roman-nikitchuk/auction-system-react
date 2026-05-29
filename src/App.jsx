import { BrowserRouter, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
=======

>>>>>>> ce866c51166b06aaa10fee174f3e16fb3e7a7072
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import UserManagementPage from './pages/UserManagementPage';
<<<<<<< HEAD
import CategoryManagementPage from './pages/CategoryManagementPage';
import { AuthProvider } from './context/AuthContext';
=======

import { AuthProvider } from './context/AuthContext';

>>>>>>> ce866c51166b06aaa10fee174f3e16fb3e7a7072
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/create-auction" element={<CreateAuctionPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
=======

          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/auctions/:id"
            element={<AuctionDetailPage />}
          />

          <Route
            path="/create-auction"
            element={<CreateAuctionPage />}
          />

          <Route
            path="/admin/users"
            element={<UserManagementPage />}
          />

>>>>>>> ce866c51166b06aaa10fee174f3e16fb3e7a7072
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;