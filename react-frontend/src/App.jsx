import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';

import MainLayout from './Layouts/MainLayout';
import Profile from './Pages/user/Profile';
import Homepage from './Pages/user/Homepage'
import Viewproduct from './Pages/user/Viewproduct';
import About from './Pages/user/About';
import Cart from './Pages/user/Cart';

import AdminLayout from './Layouts/AdminLayout';
import Dashboard from './Pages/admin/ManageProducts/Dashboard';
import Manageproducts from './Pages/admin/ManageProducts/Manageproducts';
import Createproduct from './Pages/admin/ManageProducts/Createproduct';
import Updateproduct from './Pages/admin/ManageProducts/Updateproduct';
import UsersList from './Pages/admin/ManageUsers/Manageusers';


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
        <Route path="/" element={ <MainLayout />}>
          <Route index element={<Homepage/>}></Route>
          <Route path="profile/:id" element={<Profile/>}></Route>
          <Route path="homepage" element={<Homepage/>}></Route>
          <Route path="viewProduct/:id" element={<Viewproduct/>}></Route>
          <Route path="about" element={<About/>}></Route>
          <Route path="cart" element={<Cart/>}>
          
          </Route>

          
        </Route>

        {/* Protected routes */}
        <Route path="/admin" element={<AdminLayout />} >
          <Route index element={<Dashboard/>}></Route>
          <Route path="manageproducts" element={<Manageproducts/>}></Route>
          <Route path="createProduct" element={<Createproduct/>}></Route>
          <Route path="updateProduct/:id" element={<Updateproduct/>}></Route>

          <Route path="manageusers" element={<UsersList/>}></Route>
        </Route>

       

     
      </Routes>
    </Router>
  );
}

export default App;