import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import MainLayout from './Layouts/MainLayout';

import AdminLayout from './Layouts/AdminLayout';
import Dashboard from './Pages/admin/ManageProducts/Dashboard';
import Manageproducts from './Pages/admin/ManageProducts/Manageproducts';
import Createproduct from './Pages/admin/ManageProducts/Createproduct';
import Updateproduct from './Pages/admin/ManageProducts/Updateproduct';



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
          <Route path="manageproducts" element={<Manageproducts/>}></Route>
          <Route path="createProduct" element={<Createproduct/>}></Route>
          <Route path="updateProduct/:id" element={<Updateproduct/>}></Route>
          
        </Route>

       

     
      </Routes>
    </Router>
  );
}

export default App;