// src/components/posts/Posts.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Post from "../Post/Post";   // FIX CASE SENSITIVE
import API from "../../api";
import "./posts.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const cat = searchParams.get("cat");
  const user = searchParams.get("user");
  const q = searchParams.get("q");

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
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [cat, user, q]);

  return (
    <div className="posts">
      {posts.length === 0 ? (
        <p className="noPosts">No posts found.</p>
      ) : (
        posts.map((post) => (
          <Post post={post} key={post.postid} />
        ))
      )}
    </div>
  );
}
