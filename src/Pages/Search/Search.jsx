// project/src/Pages/Search/Search.jsx

import React, {useState} from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import SearchResultList from "../../components/SearchResultList/SearchResultList";
import './search.css';

export default function Search() {
    const [results, setResults] = useState([]);

    return (
        <div className="search">
            <div className="searchContainer">
                <h1 className="searchTitle">Search Posts</h1>
                <SearchBar className="searchBar" setResults={setResults} />
                <SearchResultList results={results} />
            </div>
        </div>
    );
}