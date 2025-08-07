import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Enter username and password.");
      return;
    }

    const data = {
      username,
      password
    };

    const url = "http://127.0.0.1:5000/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }

    const response = await fetch(url, options);
    const message = await response.json();

    if (response.status !== 201 && response.status !== 200) {
      alert(message.message || "Failed to login.");
    } else {
        // if no errors, log user into database
        onLogin(message.user);
    }
  };


  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>
      <label>
        Username: <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
