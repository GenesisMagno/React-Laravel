import { Link, useNavigate, Outlet} from "react-router-dom";
import { useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useLogout, useUser } from "../hooks/useAuth";

export default function MainLayout() {
  const navigate = useNavigate();
  const logout = useLogout();

  const { data: user, isLoading: userLoading, isError: userError } = useUser();

  const handleLogout = () => {
    logout.mutate();
    navigate("/login");
    
  };

  return (
    <div className="flex flex-col h-screen  ">
      <nav className="flex w-full min-h-24 bg-neutral-900 items-center justify-end px-72">
        <img
          src={`${import.meta.env.VITE_API_URL}/images/bettertastelogo.png`}
          className="mr-auto h-16 w-24 flex"
          alt="Logo"
        />
        <ul className="flex text-[18px]">
          <li className="hover:bg-gray-800 text-gray-200 font-medium py-2 px-3 rounded-xl">
            <Link to="/homepage">Products</Link>
          </li>
          <li className="hover:bg-gray-800 text-gray-200 font-medium py-2 px-3 rounded-xl">
            <Link to="/purchased">Purchased</Link>
          </li>
          <li className="hover:bg-gray-800 text-gray-200 font-medium py-2 px-3 rounded-xl">
            <Link to="/about">About</Link>
          </li>

          {user ? (
            <div className="group relative">
              <img
               src={`${import.meta.env.VITE_API_URL}/storage/${user?.image}`||`${import.meta.env.VITE_API_URL}/images/noimage.png`}
                alt="profile"
                className="ml-2 h-10 w-10 rounded-full cursor-pointer"
              />
              <div className="absolute mt-2 right-0 w-44 bg-neutral-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <ul className="text-sm text-white">
                  <li>
                    <Link
                      to={`/profile/${user.id}`}
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/earnings"
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Earnings
                    </Link>
                  </li>
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
          ):userLoading?(
            <span></span>
          ) : (
            <Link
              to="/login"
              className="hover:bg-gray-800 text-gray-200 font-medium py-2 px-3 rounded-xl"
            >
              Login/Signup
            </Link>
          )}
        </ul>
      </nav>

      <div className="flex-grow  px-72 box-border bg-gray-50  ">
        <Outlet />
      </div>

      <script
        src="https://cdn.jsdelivr.net/npm/flowbite@1.7.0/dist/flowbite.min.js"
        defer
      ></script>
    </div>
  );
}
