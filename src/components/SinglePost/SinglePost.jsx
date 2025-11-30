// src/components/singlePost/SinglePost.jsx
import React, { useContext, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import { getImageUrl } from "../../constants";
import "./singlePost.css";

export default function SinglePost({ post }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);

  const fetchComments = useCallback(async () => {
    if (!post?.postid) return;
    try {
      const res = await API.get(`/comments/post/${post.postid}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [post?.postid]);

  const checkIfLiked = useCallback(() => {
    if (post?.likedBy && user?.username) {
      setIsLiked(post.likedBy.includes(user.username));
    } else {
      setIsLiked(false);
    }
  }, [post?.likedBy, user?.username]);

  useEffect(() => {
    if (post?.postid) {
      fetchComments();
      checkIfLiked();
      setLikeCount(post.likeCount || 0);
    }
  }, [post?.postid, post?.likeCount, post?.likedBy, fetchComments, checkIfLiked]);

  if (!post) return <div className="singlePost">Loading...</div>;

  // Check ownership by username
  // Use originalUsername to handle cases where user changed username but posts still have old username
  // Backend checks ownership via JWT token username, which may still be old until logout
  const isOwner = user && (
    user.username === post.username || 
    user.originalUsername === post.username
  );
  
  // Display current username if user is owner, otherwise show post's stored username
  const displayUsername = isOwner ? user.username : post.username;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/posts/${post.postid}`);
      navigate("/");
    } catch (err) {
      alert("Delete failed: " + (err.response?.data || err.message));
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like posts");
      return;
    }

    // Optimistic update for better UX
    const previousLikedState = isLiked;
    const previousLikeCount = likeCount;
    
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (previousLikedState ? prev - 1 : prev + 1));

    try {
      const res = await API.post(`/posts/${post.postid}/like`);
      // DEBUG: inspect server response to confirm what it returns
      console.log("POST /posts/:id/like response:", res.data);

      // If backend returns likedBy as usernames, check user.username
      const backendLikedBy = res.data.likedBy || [];
      const newIsLiked = user?.username ? backendLikedBy.includes(user.username) : false;

      setIsLiked(newIsLiked);
      setLikeCount(res.data.likeCount ?? 0);

      // Optional: if you still see inconsistencies, force-refresh the post
      // const postRes = await API.get(`/posts/${post.postid}`);
      // if (postRes.data) setLikeCount(postRes.data.likeCount || 0);
    } catch (err) {
      // revert on error
      setIsLiked(previousLikedState);
      setLikeCount(previousLikeCount);
      alert("Failed to " + (previousLikedState ? "unlike" : "like") + " post: " + (err.response?.data?.message || err.message));
      console.error("Failed to toggle like:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await API.post("/comments", {
        postid: post.postid,
        text: newComment.trim()
      });
      setNewComment("");
      fetchComments();
      // Refresh post to update comment count
      const postRes = await API.get(`/posts/${post.postid}`);
      if (postRes.data) {
        post.commentCount = postRes.data.commentCount;
      }
    } catch (err) {
      alert("Failed to add comment: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentid) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await API.delete(`/comments/${commentid}`);
      fetchComments();
      // Refresh post to update comment count
      const postRes = await API.get(`/posts/${post.postid}`);
      if (postRes.data) {
        post.commentCount = postRes.data.commentCount;
      }
    } catch (err) {
      alert("Failed to delete comment: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">

        {post.photo && (
          <img
            src={getImageUrl(post.photo)}
            alt={post.title}
            className="singlePostImg"
          />
        )}

        <h1 className="singlePostTitle">
          {post.title}
          {isOwner && (
            <div className="singlePostEdit">
              <Link
                to={`/write?edit=${post.postid}`}
                state={{ post }}
                className="link"
              >
                <i className="singlePostIcon fa-solid fa-pen-to-square"></i>
              </Link>

              <i
                className="singlePostIcon fa-solid fa-trash"
                onClick={handleDelete}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
        </h1>

        <div className="singlePostInfo">
          <span className="singlePostAuthor">
            Author: <b>{displayUsername}</b>
          </span>
          <span className="singlePostDate">
            {new Date(post.createdAt).toDateString()}
          </span>
        </div>

        <p className="singlePostDesc">{post.desc}</p>

        {post.categories && post.categories.length > 0 && (
          <div className="singlePostCats">
            {post.categories.map((cat) => (
              <span key={cat} className="singlePostCat">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Like Section */}
        <div className="singlePostActions">
          <button 
            onClick={handleLike} 
            className={`likeBtn ${isLiked ? 'liked' : ''}`}
            disabled={!user}
          >
            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
            <span>{likeCount}</span>
          </button>
          <span className="commentCount">
            <i className="fa-regular fa-comment"></i>
            {post.commentCount || 0} comments
          </span>
        </div>

        {/* Comments Section */}
        <div className="commentsSection">
          <h3 className="commentsTitle">Comments ({post.commentCount || 0})</h3>
          
          {user && (
            <form onSubmit={handleCommentSubmit} className="commentForm">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="commentInput"
                rows="3"
              />
              <button type="submit" className="commentSubmitBtn" disabled={loading || !newComment.trim()}>
                {loading ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}

          <div className="commentsList">
            {comments.length === 0 ? (
              <p className="noComments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.commentid} className="commentItem">
                  <div className="commentHeader">
                    <span className="commentAuthor">{comment.username}</span>
                    <span className="commentDate">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {user && user.username === comment.username && (
                      <button
                        onClick={() => handleDeleteComment(comment.commentid)}
                        className="deleteCommentBtn"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className="commentText">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
