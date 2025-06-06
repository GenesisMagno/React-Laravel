import React from 'react';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';
import Dashboard from './Pages/admin/Dashboard';
import Manageproducts from './Pages/admin/Manageproducts';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={ <Login />} 
        />
        <Route 
          path="/register" 
          element={<Register />} 
        />
        <Route 
          path="/" 
          element={ <Register />} 
        />

        {/* Protected routes */}
        <Route path="/admin" element={<AdminLayout />} >
          <Route index element={<Dashboard/>}></Route>
          
        </Route>

       

     
      </Routes>
    </Router>
  );
}

export default App;