// src/pages/Categories/Categories.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import Category from "../../components/Category/Category";
import SearchResultList from "../../components/SearchResultList/SearchResultList";
import "./Categories.css";

export default function Categories() {
    const [cats, setCats] = useState([]);
    const [newCat, setNewCat] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        console.log("[Categories] User state:", {
            user: user,
            userId: user?.id,
            willShowForm: !!user?.id
        });
    }, [user]);

    const fetchCategories = async () => {
        try {
            const res = await API.get("/categories");
            const categories = Array.isArray(res.data) ? res.data : [];
            console.log("[Categories] Fetched categories:", categories.map(c => ({
                name: c.name,
                postCount: c.postCount,
                categoryid: c.categoryid
            })));
            setCats(categories);
        } catch (err) {
            console.error("Failed fetch categories:", err);
        }
    };

    const handleCategoryClick = async (categoryName) => {
        setSelectedCategory(categoryName);
        setLoadingPosts(true);
        setFilteredPosts([]);

        try {
            const res = await API.get(`/posts?cat=${encodeURIComponent(categoryName)}`);
            setFilteredPosts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch posts for category:", err);
            setFilteredPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleClearFilter = () => {
        setSelectedCategory(null);
        setFilteredPosts([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = newCat.trim();
        if (!trimmed) return;

        // Check if category already exists (case-insensitive) before executing
        if (cats.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            setError("The category has already existed.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await API.post("/categories", { name: trimmed });
            setNewCat("");
            fetchCategories();
        } catch (err) {
            // Handle backend validation error or other errors
            const errorMessage = err.response?.data || err.message || "";
            if (errorMessage === "The category has already existed." ||
                errorMessage === "Category already exists" ||
                errorMessage.includes("already existed") ||
                errorMessage.includes("already exists")) {
                setError("The category has already existed.");
            } else {
                setError("Failed to create category");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="categoriesPage">
            <div className="categoriesContainer">
                <h1>Manage Categories</h1>

                {user?.id && (
                    <div className="createCategory">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="New category name..."
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                                className="catInput"
                            />
                            <button type="submit" className="catBtn" disabled={loading}>
                                {loading ? "Creating..." : "Add Category"}
                            </button>
                        </form>
                        {error && <p className="error">{error}</p>}
                    </div>
                )}

                <div className="categoriesList">
                    <h2>All Categories ({cats.length})</h2>

                    {cats.length === 0 ? (
                        <p>No categories yet.</p>
                    ) : (
                        <div className="catsGrid">
                            {cats.map((c) => (
                                <div 
                                    key={c.categoryid || c._id} 
                                    className="catCard"
                                >
                                    <Category 
                                        cat={c} 
                                        onClick={handleCategoryClick}
                                        disableLink={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedCategory && (
                    <div className="categoryPostsSection">
                        <div className="categoryPostsHeader">
                            <h2>Posts in "{selectedCategory}"</h2>
                            <button 
                                onClick={handleClearFilter}
                                className="clearFilterBtn"
                            >
                                Clear Filter
                            </button>
                        </div>
                        {loadingPosts ? (
                            <p>Loading posts...</p>
                        ) : filteredPosts.length === 0 ? (
                            <p className="noPosts">No posts found in this category.</p>
                        ) : (
                            <SearchResultList results={filteredPosts} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
