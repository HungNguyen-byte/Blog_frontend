// project/src/components/SearchBar/SearchBar.jsx

import React, {useState, useEffect, useRef} from "react";
import API from "../../api"
import './searchBar.css';

export default function SearchBar ({ setResults }) {
    const [query, setQuery] = useState("");
    const debounceRef = useRef(null);

    const fetchPosts = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        try {
            const res = await API.get(`/posts?q=${searchQuery}`);
            setResults(res.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setResults([]);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchPosts(query);
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);


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