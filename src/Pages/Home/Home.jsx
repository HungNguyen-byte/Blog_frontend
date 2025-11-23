// src/Pages/Home/Home.jsx

import "./home.css";
import Header from "../../components/Header/Header";
import Posts from "../../components/Posts/Posts";
import SlideBar from "../../components/SlideBar/SlideBar";

export default function Home() {
    return (
        <>
            <Header />
            <div className="home">
                <Posts />
                <SlideBar />
            </div>
        </>
    )
}