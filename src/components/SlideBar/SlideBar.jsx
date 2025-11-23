// src/components/SlideBar/SlideBar.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./slideBar.css";
import API from "../../api";
import { getImageUrl } from "../../constants";

export default function SlideBar() {
    const [mostLikedPost, setMostLikedPost] = useState(null);
    const [topCategories, setTopCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all posts
                const postsRes = await API.get("/posts");
                const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
                
                // Find post with highest likeCount, if tie then newest post
                if (posts.length > 0) {
                    const mostLiked = posts.reduce((prev, current) => {
                        const prevLikes = prev.likeCount || 0;
                        const currentLikes = current.likeCount || 0;
                        
                        // If current has more likes, choose current
                        if (currentLikes > prevLikes) {
                            return current;
                        }
                        // If prev has more likes, choose prev
                        if (prevLikes > currentLikes) {
                            return prev;
                        }
                        // If likes are equal, choose the newest one (by createdAt)
                        const prevDate = new Date(prev.createdAt || 0);
                        const currentDate = new Date(current.createdAt || 0);
                        return currentDate > prevDate ? current : prev;
                    });
                    setMostLikedPost(mostLiked);
                }

                // Fetch all categories
                const categoriesRes = await API.get("/categories");
                const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
                
                // Sort by postCount descending and take top 6
                const sorted = categories
                    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
                    .slice(0, 6);
                setTopCategories(sorted);
            } catch (err) {
                console.error("Failed to fetch sidebar data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryClick = (categoryName) => {
        navigate(`/?cat=${encodeURIComponent(categoryName)}`);
    };

    return (
        <div className="slidebar">
            <div className="slidebarItem">
                <span className="slidebarTitle">MOST LIKED POST</span>
                {loading ? (
                    <p>Loading...</p>
                ) : mostLikedPost ? (
                    <>
                        {mostLikedPost.photo && (
                            <Link to={`/post/${mostLikedPost.postid}`}>
                                <div className="slidebarImageWrapper">
                                    <img
                                        src={getImageUrl(mostLikedPost.photo)}
                                        alt={mostLikedPost.title}
                                        style={{ cursor: "pointer" }}
                                    />
                                </div>
                            </Link>
                        )}
                        <Link to={`/post/${mostLikedPost.postid}`} className="link">
                            <p style={{ cursor: "pointer" }}>
                                {mostLikedPost.desc
                                    ? (mostLikedPost.desc.length > 150
                                        ? mostLikedPost.desc.substring(0, 150) + "..."
                                        : mostLikedPost.desc)
                                    : "No description available"}
                            </p>
                        </Link>
                        <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                            <i className="fa-regular fa-heart"></i> {mostLikedPost.likeCount || 0} likes
                        </div>
                    </>
                ) : (
                    <p>No posts available</p>
                )}
            </div>
            <div className="slidebarItem">
                <span className="slidebarTitle">CATEGORIES</span>
                {loading ? (
                    <p>Loading...</p>
                ) : topCategories.length > 0 ? (
                    <ul className="slidebarList">
                        {topCategories.map((category) => (
                            <li 
                                key={category.categoryid || category.name}
                                className="slidebarListItem"
                                onClick={() => handleCategoryClick(category.name)}
                                style={{ cursor: "pointer" }}
                            >
                                {category.name} ({category.postCount || 0})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No categories available</p>
                )}
            </div>
            <div className="slidebarItem">
                <span className="slidebarTitle">FOLLOW US</span>
                <div className="slidebarSocial">
                    <i className="slidebarIcon fa-brands fa-square-facebook"></i>
                    <i className="slidebarIcon fa-brands fa-square-twitter"></i>
                    <i className="slidebarIcon fa-brands fa-square-pinterest"></i>
                    <i className="slidebarIcon fa-brands fa-square-instagram"></i>
                </div>
            </div>
        </div>
    )
}