// src/components/Category/Category.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./category.css";

export default function Category({ cat, onClick, disableLink = false }) {
    useEffect(() => {
        if (cat) {
            console.log("[Category] Rendering category:", {
                name: cat.name,
                postCount: cat.postCount,
                willShowCount: cat.postCount > 0
            });
        }
    }, [cat]);

    if (!cat) return null;

    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(cat.name);
        }
    };

    // Check if category is at risk (no posts - will be deleted after 2 days of no use)
    const isAtRisk = cat.postCount === 0;

    const content = (
        <>
            <span className={`categoryName ${isAtRisk ? 'atRisk' : ''}`}>{cat.name}</span>
            {cat.postCount > 0 ? (
                <span className="categoryCount">({cat.postCount})</span>
            ) : (
                <span className="categoryWarning" title="This category has no posts and will be automatically deleted after 2 days of no use">
                    (No posts)
                </span>
            )}
        </>
    );

    return (
        <div className={`categoryItem ${isAtRisk ? 'categoryAtRisk' : ''}`}>
            {disableLink ? (
                <div className="link" onClick={handleClick}>
                    {content}
                </div>
            ) : (
                <Link to={`/?cat=${cat.name}`} className="link" onClick={handleClick}>
                    {content}
                </Link>
            )}
        </div>
    );
}
