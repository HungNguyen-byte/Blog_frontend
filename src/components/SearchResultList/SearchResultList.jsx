// src/components/SearchResultList/SearchResultList.jsx

import React from "react";
import { Link } from "react-router-dom";
import './searchResultList.css';

export default function SearchResultList({ results }) {
    if (results.length === 0) {
        return null;
    }

    return (
        <div className="searchResultList">
            {results.map((post) => (
                <Link
                    key={post.postid}
                    to={`/post/${post.postid}`}
                    className="searchResultLink"
                >
                    <div className="searchResultItem">
                        <h3 className="resultTitle">{post.title}</h3>
                        <p className="resultSnippet">
                            {post.desc.substring(0, 100)}
                            {post.desc.length > 100 ? "..." : ""}
                        </p>
                        <span className="resultDate">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}