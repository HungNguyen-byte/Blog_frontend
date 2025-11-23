// src/Pages/Single/Single.jsx

import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import SinglePost from "../../components/SinglePost/SinglePost";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function Single() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!id) {
            return <div>Invalid post ID</div>;
        }

        const fetchPost = async () => {
            try {
                const res = await API.get(`/posts/${id}`);
                setPost(res.data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        };
        fetchPost();
    }, [id]);

    if (error) return <div className="single"><p>Error: {error}</p></div>;
    if (!post) return <div className="single"><p>Loading...</p></div>;

    return (
        <div className="single">
            <SinglePost post={post} />
        </div>
    );
}