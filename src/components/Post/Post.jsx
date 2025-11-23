import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../constants";
import "./post.css";

export default function Post({ post }) {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    navigate(`/?cat=${cat}`);
  };

  return (
    <div className="post">
      {post.photo && (
        <img
          className="postImg"
          src={getImageUrl(post.photo)}
          alt={post.title}
        />
      )}
      <div className="postInfo">
        <div className="postCats">
          {post.categories && post.categories.length > 0 ? (
            post.categories.map((cat) => (
              <span
                key={cat}
                className="postCat"
                onClick={() => handleCategoryClick(cat)}
                style={{ cursor: "pointer" }}
              >
                {cat}
              </span>
            ))
          ) : (
            <span className="postCat">Uncategorized</span>
          )}
        </div>

        <Link to={`/post/${post.postid}`} className="link">
          <span className="postTitle">{post.title}</span>
        </Link>

        <hr />
        <div className="postMeta">
          <span className="postDate">
            {new Date(post.createdAt).toDateString()}
          </span>
          <div className="postStats">
            <span className="postStat">
              <i className="fa-regular fa-heart"></i>
              {post.likeCount || 0}
            </span>
            <span className="postStat">
              <i className="fa-regular fa-comment"></i>
              {post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>

      <p className="postDesc">{post.desc}</p>
    </div>
  );
}