import React, { useState } from "react";

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username,
      password,
      role
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/create_contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.status !== 201 && response.status !== 200) {
        const message = await response.json();
        alert(message.message || "Failed to register.");
      } else {
        // if no errors, register user in database
        const newUser = {
          username: username,
          password: password,
          role: role
        };
        onRegister(newUser);
      }
    } catch (err) {
      alert("Registration failed: ", err);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <label>
        Username: 
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Password: 
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <label>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
