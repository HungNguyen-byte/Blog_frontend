// src/components/TopBar/TopBar.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./topBar.css";

export default function TopBar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSearchClick = () => {
        navigate("/search");
    };

    return (
        <div className="top">
            <div className="topLeft">
                <i className="topIcon fa-brands fa-square-facebook"></i>
                <i className="topIcon fa-brands fa-square-twitter"></i>
                <i className="topIcon fa-brands fa-square-pinterest"></i>
                <i className="topIcon fa-brands fa-square-instagram"></i>
            </div>

            <div className="topCenter">
                <ul className="topList">
                    <li className="topListItem">
                        <Link className="link" to="/">HOME</Link>
                    </li>

                    <li className="topListItem">
                        <Link className="link" to="/about">ABOUT</Link>
                    </li>

                    <li className="topListItem">
                        <Link className="link" to="/categories">CATEGORIES</Link>
                    </li>

                    <li className="topListItem">
                        <Link className="link" to="/write">WRITE</Link>
                    </li>

                    {user && (
                        <li className="topListItem" onClick={logout} style={{ cursor: "pointer" }}>
                            LOGOUT
                        </li>
                    )}
                </ul>
            </div>

            <div className="topRight">
                {user ? (
                    <>
                        <Link to="/settings">
                            <img
                                className="topImg"
                                src={user.profilePic || "https://via.placeholder.com/40"}
                                alt={user.username}
                            />
                        </Link>
                        <span style={{ marginLeft: "8px", fontWeight: "500" }}>
                            {user.username}
                        </span>
                    </>
                ) : (
                    <ul className="topList">
                        <li className="topListItem">
                            <Link className="link" to="/login">LOGIN</Link>
                        </li>

                        <li className="topListItem">
                            <Link className="link" to="/register">REGISTER</Link>
                        </li>
                    </ul>
                )}
                <i
                    className="topSearchIcon fa-solid fa-magnifying-glass"
                    onClick={handleSearchClick}
                    style={{ cursor: "pointer" }}
                    title="Search posts"
                ></i>
            </div>
        </div>
    );
}