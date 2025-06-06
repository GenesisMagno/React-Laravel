import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useUser, useLogout } from '../hooks/useAuth';

export default function AdminLayout() {
    const { data: user, isLoading } = useUser();
    const logout = useLogout();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout.mutate();
        navigate('/login');
  };

    const [selectedIndex, setSelectedIndex] = useState(0);

    const DashboardItems = [
        { label: "Dashboard", icon: "fa-chart-line", href: "/admin/dashboard" },
        { label: "Manage Products", icon: "fa-list-check", href: "/products" },
        { label: "Orders", icon: "fa-list-check", href: "/orders" },
        { label: "Users", icon: "fa-list-check", href: "/users" },
        { label: "Payments", icon: "fa-list-check", href: "/payments" },
        { label: "System Setting", icon: "fa-list-check", href: "/settings" },
    ];

    return (
        <>
            
            <div className="flex flex-col h-screen">
                <nav className="flex w-full min-h-20 bg-white items-center justify-end px-20 shadow shadow-gray-400 z-10">
                    <div className="text-4xl font-medium mr-auto pl-12">Admin</div>
                    <div className="relative">
                        <div className="group">
                            <img 
                                src="/images/bettertastelogo.png"
                                alt="profile"
                                className="ml-2 h-8 w-8 rounded-full cursor-pointer"
                            />
                            <div className="absolute mt-2 right-0 w-44 bg-neutral-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <ul className="text-sm text-white">
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-700">Profile</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-700">Settings</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-700">Earnings</a></li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                        >
                                            Log out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                <div id="container" className="flex w-full h-[calc(100%-80px)]">
                    <div className="w-1/5 pt-14">
                        <ul className="m-auto 2xl:w-4/5 text-lg h-full">
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
                    </div>

                    <div className="w-4/5 h-full bg-gray-200 px-24 pt-20 pb-12">
                        <Outlet/>
                    </div>
                </div>
            </div>

            <script 
                src="https://cdn.jsdelivr.net/npm/flowbite@1.7.0/dist/flowbite.min.js" 
                defer
            ></script>
        </>
    );
}
