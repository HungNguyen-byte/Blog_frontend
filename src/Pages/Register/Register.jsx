// src/Pages/Register/Register.jsx
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import './register.css'

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Check if username already exists before registration
            try {
                const checkRes = await API.get(`/users/check-username?username=${encodeURIComponent(username)}`);
                if (checkRes.data === true) {
                    setError("The username has already existed");
                    setLoading(false);
                    return;
                }
            } catch (checkErr) {
                // If check endpoint fails, continue with registration (backend will validate)
                // But if it's a 400/error indicating username exists, stop here
                if (checkErr.response?.data === true) {
                    setError("The username has already existed");
                    setLoading(false);
                    return;
                }
            }

            await register(username, email, password);
        } catch (err) {
            // Handle registration error
            if (err.response?.data === "Username already exists" || err.message === "Username already exists") {
                setError("The username has already existed");
            } else {
                setError(err.response?.data || err.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register">
            <span className="registerTitle">Register</span>
            {error && <p className="errorMsg">{error}</p>}
            <form className="registerForm" onSubmit={handleSubmit}>
                <label>Username</label>
                <input
                    className="registerInput"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength="3"
                />
                <label>Email</label>
                <input
                    className="registerInput"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Password</label>
                <input
                    className="registerInput"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                />
                <button className="registerButton" type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Register"}
                </button>
            </form>
            <button className="registerLoginButton">
                <Link className="link" to="/login">Login</Link>
            </button>
        </div>
    );
}