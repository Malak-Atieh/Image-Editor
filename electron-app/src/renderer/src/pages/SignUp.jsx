import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { requestMethods } from "../utils/enums/request.methods";
import { request } from "../utils/remote/axios";
import '../assets/login.css';

const SignUp = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });


  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); 

    if (!form.name || !form.email || !form.password) {
      setError("Credentials are required.");
      return;
    }
  
    try {
      const response = await request({
        method: requestMethods.POST,
        route: "/register",
        body: form,  
      });
      console.log(response);
      if (response.success) {
        navigate("/");
      } else if (response.msg === "missing attr") {

        const firstError = Object.values(response.errors)[0][0];
        setError(firstError);
      } else if (response.error === "Unauthorized") {
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
      <form onSubmit={handleSignUp} className="login-form">
        <h2 className="text-2xl font-bold text-600 mb-6">Hello freind!</h2>

        <label>User Name</label>
        <input
          type="text"
          name="name"
          placeholder="johnDoe"
          value={form.name}

          onChange={handleInputChange}
          />

        <label>Email address</label>
        <input
          type="email"
          name="email"
          placeholder="johnDoe@example.com"
          value={form.email}

          onChange={handleInputChange}
          />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="more than 8 characters"
          value={form.password}

          onChange={handleInputChange}
          />

        {error && <p className="error">{error}</p>}

        <button type="submit">Sign Up</button>
        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
