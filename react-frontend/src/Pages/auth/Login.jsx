import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Login() {

  const navigate = useNavigate();
  const login = useLogin();
  const [data, setData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);


  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setProcessing(true);
  setErrors({});

  fetch('https://react-laravel-production-232e.up.railway.app/api/test-login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        email: 'your-email@example.com',
        password: 'your-password'
    })
})
.then(response => response.json())
.then(data => {
    console.log('TEST RESPONSE:', data);
    // This will show you exactly what's happening at each step
});
};


  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen w-screen">
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="/images/gengen.png"
          alt="Login Illustration"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="lg:p-36 md:p-52 sm:p-20 p-8 w-full sm:w-1/2">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
            {errors.email && <span className="text-red-700">{errors.email}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={data.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
            {errors.password && <span className="text-red-700">{errors.password}</span>}
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={data.remember}
              onChange={handleChange}
              className="text-blue-500"
            />
            <label htmlFor="remember" className="text-gray-600 ml-2">Remember Me</label>
          </div>

          {errors.general && <div className="mb-4 text-red-700">{errors.general}</div>}

          <div className="mb-6 text-blue-500">
            <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full mb-4"
            disabled={processing}
          >
            {processing ? "Logging in..." : "Login"}
          </button>

          <hr className="border-none bg-gray-300 h-[1px]" />
        </form>

        <a
          href="/auth/google"
          className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-2 border border-gray-300 mt-4"
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#FBBC05" d="M0 37V11l17 13z" />
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
            </svg>
            <span className="ml-4">Log in with Google</span>
          </div>
        </a>

        <Link to={"/register"} className="mt-6 text-blue-500 text-center">
          <span className="hover:underline">Sign up Here</span>
        </Link>
      </div>
    </div>
  );
}
