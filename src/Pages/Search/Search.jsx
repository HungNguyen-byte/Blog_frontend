// project/src/Pages/Search/Search.jsx

import React, {useState, useEffect} from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import SearchResultList from "../../components/SearchResultList/SearchResultList";
import API from "../../api";
import './search.css';

export default function Search() {
    const [results, setResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await API.get("/categories");
                setCategories(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    return (
        <div className="search">
            <div className="searchContainer">
                <h1 className="searchTitle">Search Posts</h1>
                <div className="searchFilters">
                    <SearchBar 
                        className="searchBar" 
                        setResults={setResults}
                        selectedCategory={selectedCategory}
                    />
                    <div className="categoryFilterWrapper">
                        <select
                            className="categoryFilter"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.categoryid || cat._id} value={cat.name}>
                                    {cat.name} ({cat.postCount || 0})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <SearchResultList results={results} />
            </div>
        </div>
    );
}