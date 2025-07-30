import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useUser, useLogout } from '../hooks/useAuth';

export default function AdminLayout() {
    const logout = useLogout();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


    const handleLogout = () => {
        logout.mutate();
        navigate('/login');
  };

    const [selectedIndex, setSelectedIndex] = useState(0);

    const DashboardItems = [
        { label: "Dashboard", icon: "fa-chart-line", href: "/admin" },
        { label: "Manage Products", icon: "fa-list-check", href: "/admin/manageproducts" },
        { label: "Orders", icon: "fa-list-check", href: "/admin/manageorders" },
        { label: "Users", icon: "fa-list-check", href: "/admin/manageusers" },
        { label: "Payments", icon: "fa-list-check", href: "/admin/managepayments" },
        { label: "System Setting", icon: "fa-list-check", href: "/settings" },
    ];

    return (
 
            <div className="flex flex-col h-screen">
                <nav className="flex w-full min-h-20 bg-white items-center justify-end px-20 shadow shadow-gray-400 z-10">
                    <div className="text-4xl font-medium mr-auto pl-12">Admin</div>
                    
                </nav>

                <div id="container" className="flex w-full h-[calc(100%-80px)]">
                    <div className="w-1/5 py-14 flex flex-col justify-between">
                        <ul className="mx-auto 2xl:w-4/5 text-lg">
                            {DashboardItems.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={item.href}
                                        className={`h-[60px] w-full lg:text-[20px] rounded-sm flex items-center px-4 cursor-pointer
                                            hover:bg-gray-200 transition
                                            ${selectedIndex === index ? "bg-gray-300 font-semibold" : ""}
                                        `}
                                        onClick={() => setSelectedIndex(index)}
                                    >
                                        <i className={`fa-solid ${item.icon} mr-3`}></i>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            
                        </ul>
                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            className='bg-red-50 w-4/5 mx-auto rounded-sm cursor-pointer hover:bg-gray-200 h-[60px] text-left p-3 lg:text-[20px] text-red-700 hover:text-red-800'>
                                <i className='fa fa-sign-out mr-3 '></i>
                            Logout
                        </button>
                    </div>

                    <div className="w-4/5 h-full bg-gray-200 px-24 py-12">
                        <Outlet/>
                    </div>
                </div>

                {showLogoutConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-sm">
                    <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                    <p className="mb-6">Are you sure you want to log out?</p>
                    <div className="flex justify-end space-x-4">
                        <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                        Cancel
                        </button>
                        <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                        Logout
                        </button>
                    </div>
                    </div>
                </div>
                )}

                <script 
                    src="https://cdn.jsdelivr.net/npm/flowbite@1.7.0/dist/flowbite.min.js" 
                    defer
                ></script>
            </div>

            

            

    );
}
