// src/components/posts/Posts.jsx
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Post from "../Post/Post";   // FIX CASE SENSITIVE
import API from "../../api";
import "./posts.css";

const POSTS_PER_PAGE = 16;

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const cat = searchParams.get("cat");
  const user = searchParams.get("user");
  const q = searchParams.get("q");

  // Sort posts by createdAt (newest first) and paginate
  const sortedAndPaginatedPosts = useMemo(() => {
    // Sort posts by createdAt in descending order (newest first)
    const sorted = [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    // Calculate pagination
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [posts, currentPage]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams();
        if (cat) params.set("cat", cat);
        if (user) params.set("user", user);
        if (q) params.set("q", q);

        const queryString = params.toString();
        const res = await API.get(`/posts${queryString ? `?${queryString}` : ""}`);

        setPosts(res.data);
        // Reset to first page when filters change
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [cat, user, q]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`paginationBtn ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        « Previous
      </button>
    );

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="paginationBtn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="paginationEllipsis">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`paginationBtn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="paginationEllipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="paginationBtn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`paginationBtn ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next »
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  return (
    <>
      <div className="posts">
        {sortedAndPaginatedPosts.length === 0 ? (
          <p className="noPosts">No posts found.</p>
        ) : (
          sortedAndPaginatedPosts.map((post) => (
            <Post post={post} key={post.postid} />
          ))
        )}
      </div>
      {renderPagination()}
    </>
  );
}
