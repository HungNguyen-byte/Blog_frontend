// src/Pages/Write/Write.jsx
import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import "./write.css";

export default function Write() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]); // Selected categories
    const [allCategories, setAllCategories] = useState([]); // From API
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const editPost = location.state?.post;

    // Fetch all categories on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await API.get("/categories");
                setAllCategories(res.data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Pre-fill form when editing
    useEffect(() => {
        if (editPost) {
            setTitle(editPost.title || "");
            setDesc(editPost.desc || "");
            setCategories(editPost.categories || []);
        }
    }, [editPost]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const postData = {
            title,
            desc,
            categories, // Array from multi-select
        };

        // In handleSubmit() — REPLACE the upload block
        if (file && file instanceof File) {
            const data = new FormData();
            const filename = Date.now() + "-" + file.name;
            data.append("name", filename);
            data.append("file", file);

            try {
                const uploadRes = await API.post("/upload", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                postData.photo = uploadRes.data.url;
            } catch (err) {
                console.error("Upload failed:", err);
                alert("Image upload failed");
                setLoading(false);
                return;
            }
        } else if (editPost?.photo) {
            postData.photo = editPost.photo;
        }

        try {
            if (editPost) {
                await API.put(`/posts/${editPost.postid}`, postData, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
            } else {
                await API.post("/posts", postData, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
            }
            navigate("/");
        } catch (err) {
            console.error("Post save failed:", err);
            alert("Failed to save post: " + (err.response?.data || err.message));
        }

    };

    const handleCategoryChange = (e) => {
        const selected = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );
        setCategories(selected);
    };

    return (
        <div className="write">
            {file && (
                <img
                    className="writeImg"
                    src={file.preview instanceof File ? URL.createObjectURL(file.preview) : file.preview}
                    alt="Preview"
                />
            )}
            <form className="writeForm" onSubmit={handleSubmit}>
                <div className="writeFormGroup">
                    <label htmlFor="fileInput">
                        <i className="writeIcon fa-solid fa-plus"></i>
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        className="writeInput"
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* New: Categories Multi-Select */}
                <div className="writeFormGroup">
                    <label htmlFor="categoriesInput">
                        Categories (Hold Ctrl/Cmd to select multiple)
                    </label>
                    <select
                        id="categoriesInput"
                        multiple
                        className="writeInput writeCategories"
                        value={categories}
                        onChange={handleCategoryChange}
                    >
                        {allCategories.map((cat) => (
                            <option key={cat.categoriesid} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="writeFormGroup">
                    <textarea
                        placeholder="Tell your story..."
                        className="writeInput writeText"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                <button className="writeSubmit" type="submit" disabled={loading}>
                    {loading
                        ? editPost
                            ? "Updating..."
                            : "Publishing..."
                        : editPost
                            ? "Update"
                            : "Publish"}
                </button>
            </form>
        </div>
    );
}
