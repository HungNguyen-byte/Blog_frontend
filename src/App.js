// src/App.jsx
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Pages
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Write from "./Pages/Write/Write";
import Settings from "./Pages/Settings/Settings";
import Single from "./Pages/Single/Single";
import About from "./Pages/About/About";
import Search from "./Pages/Search/Search";
import Categories from "./Pages/Categories/Categories";

// Components
import TopBar from "./components/TopBar/TopBar";

function App() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <TopBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={user ? <Home /> : <Login />} />
                <Route path="/register" element={user ? <Home /> : <Register />} />

                <Route path="/write" element={user ? <Write /> : <Login />} />
                <Route path="/settings" element={user ? <Settings /> : <Login />} />
                <Route path="/post/:id" element={ <Single />  } />
                <Route path="/categories" element={user ? <Categories /> : <Login />} />

                <Route path="/about" element={user ? <About /> : <Login />} />

                <Route path="/search" element={ <Search />  } />
            </Routes>
        </>
    );
}

export default App;