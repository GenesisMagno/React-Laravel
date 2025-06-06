// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from './axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/user')
      .then(res => setUser(res.data))
      .catch(() => alert('Unauthorized'));
  }, []);

  return user ? <h2>Welcome, {user.name}!</h2> : <p>Loading...</p>;
}
