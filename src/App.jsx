import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import UserManagementPage from './pages/UserManagementPage';

import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

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

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;