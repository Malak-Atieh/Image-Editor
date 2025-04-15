import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestMethods } from "../utils/enums/request.methods";
import { request } from "../utils/remote/axios";
import '../assets/login.css';

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
  
    try {
      const response = await request({
        method: requestMethods.POST,
        route: "/login",
        body: form,  
      });
      console.log(response);
      if (response.success) {
        localStorage.setItem("token", response.authorization.token);
        localStorage.setItem("user",JSON.stringify(response.user));
        console.log("Stored token:", localStorage.getItem("token")); 

        navigate("/gallery");
      } else if (response.message === "missing attr") {

        const firstError = Object.values(response.errors)[0][0];
        setError(firstError);
      } else if (response.message === "Unauthorized") {
        setError("Invalid email or password.");
      }else {
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="text-2xl font-bold text-600 mb-6">Welcome back</h2>

        <label>Email address</label>
        <input
          type="email"
          name="email"
          value={form.email}

          placeholder="johnDoe@example.com"
          onChange={handleInputChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="more than 8 characters"
          value={form.password}

          onChange={handleInputChange}
          required
          />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
        <p>
          Do not have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
