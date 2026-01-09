// project/src/components/SearchBar/SearchBar.jsx

import React, {useState, useEffect, useRef} from "react";
import API from "../../api"
import './searchBar.css';

export default function SearchBar ({ setResults, selectedCategory = "" }) {
    const [query, setQuery] = useState("");
    const debounceRef = useRef(null);

    const fetchPosts = async (searchQuery, category) => {
        const params = new URLSearchParams();
        
        if (searchQuery && searchQuery.trim()) {
            params.set("q", searchQuery.trim());
        }
        
        if (category && category.trim()) {
            params.set("cat", category.trim());
        }

        // If no search query and no category, return empty results
        if (params.toString() === "") {
            setResults([]);
            return;
        }

        try {
            const res = await API.get(`/posts?${params.toString()}`);
            setResults(res.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setResults([]);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchPosts(query, selectedCategory);
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query, selectedCategory]);


    const handleSearch = (e) => {
        setQuery(e.target.value);
    };

    return (
        <div className="searchBarWrapper">
            <i className="searchIcon fa-solid fa-magnifying-glass"></i>
                <input
                    type="text"
                    placeholder="Search posts by title or content..."
                    value={query}
                    onChange={handleSearch}
                    className="searchInput"
                />
        </div>
    );
}