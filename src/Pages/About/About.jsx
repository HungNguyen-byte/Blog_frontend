// src/Pages/About/About.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import Post from "../../components/Post/Post";
import { getImageUrl } from "../../constants";
import "./about.css";

export default function About() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Fetch posts by both originalUsername (for old posts) and current username (for new posts)
        // This handles cases where user changed their username
        const usernamesToQuery = [
          user.originalUsername || user.username, // Old posts
          user.username // New posts (if different from original)
        ].filter((u, index, arr) => arr.indexOf(u) === index); // Remove duplicates
        
        // Fetch posts for each username and combine results
        const allPostsPromises = usernamesToQuery.map(username => 
          API.get(`/posts?user=${username}`).then(res => res.data)
        );
        
        const allPostsArrays = await Promise.all(allPostsPromises);
        // Flatten and deduplicate by postid
        const postsMap = new Map();
        allPostsArrays.flat().forEach(post => {
          if (post.postid && !postsMap.has(post.postid)) {
            postsMap.set(post.postid, post);
          }
        });
        
        // Sort by creation date (newest first)
        const sortedPosts = Array.from(postsMap.values()).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setPosts(sortedPosts);
      } catch (err) {
        setError("Failed to load your posts.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="about">
        <div className="aboutWrapper">
          <h1 className="aboutTitle">About</h1>
          <p>Please log in to view your post history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about">
      <div className="aboutWrapper">
        <div className="aboutSection">
          <h1 className="aboutTitle">About Me</h1>
          <div className="aboutMe">
            {/* MATCHES Settings.jsx EXACTLY */}
            <img
              src={
                user.profilePic
                  ? getImageUrl(user.profilePic)
                  : getImageUrl("default-avatar.png")
              }
              alt={user.username}
              className="aboutImg"
            />
            <p className="aboutBio">
              Hi, I'm <strong>{user.username}</strong>. I love writing about life,
              technology, and everything in between. This is my personal blog where
              I share my thoughts and experiences.
            </p>
          </div>
        </div>

        {/* ... rest of the posts section (unchanged) ... */}
        <div className="aboutSection">
          <h2 className="aboutSubtitle">My Published Posts ({posts.length})</h2>

          {loading && <p className="aboutLoading">Loading your posts...</p>}
          {error && <p className="aboutError">{error}</p>}

          {!loading && posts.length === 0 && (
            <p className="aboutEmpty">You haven't published any posts yet.</p>
          )}

          <div className="aboutPosts">
            {posts.map((post) => (
              <Post key={post.postid} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}