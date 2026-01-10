// src/Pages/Settings/Settings.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { getImageUrl } from "../../constants";
import "./settings.css";

export default function Settings() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameChanged, setUsernameChanged] = useState(false);

  /** Load initial profile */
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFile(user.profilePic ? { preview: user.profilePic } : null);
    }
  }, [user]);

  /** Upload image to backend (Cloudinary wrapper) */
  const uploadImage = async () => {
    if (!file || !(file instanceof File)) return user.profilePic;

    const formData = new FormData();
    formData.append("file", file);

    const res = await API.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
  };

  /** Build updated user object */
  const buildUpdateBody = (profilePicUrl) => {
    const body = { username, email };
    if (password.trim()) body.password = password;
    if (profilePicUrl !== user.profilePic) body.profilePic = profilePicUrl;
    return body;
  };

  /** Handle update click */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Check if username has changed and if new username already exists
      if (username !== user.username && username.trim()) {
        try {
          const checkRes = await API.get(`/users/check-username?username=${encodeURIComponent(username)}&excludeUserId=${encodeURIComponent(user.id)}`);
          if (checkRes.data === true) {
            setError("The username has already existed");
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          // If check endpoint fails, continue with update (backend will validate)
          // But if it's an error indicating username exists, stop here
          if (checkErr.response?.data === true) {
            setError("The username has already existed");
            setLoading(false);
            return;
          }
        }
      }

      // 1. Upload image if changed
      const profilePicUrl = await uploadImage();

      // 2. Build request body
      const updatedBody = buildUpdateBody(profilePicUrl);

      // 3. Send update API
      const res = await API.put(`/users/${user.id}`, updatedBody);

      // 4. Check if username changed
      const usernameDidChange = res.data.username !== user.username;
      
      // 5. Update AuthContext and localStorage
      const updatedUser = {
        ...user,
        username: res.data.username,
        email: res.data.email,
        profilePic: res.data.profilePic,
      };

      updateUser(updatedUser);
      
      if (usernameDidChange) {
        setUsernameChanged(true);
        setSuccess("Username updated! Please log out and log back in for changes to take full effect.");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }

    } catch (err) {
      // Handle update error
      if (err.response?.data === "The username has already existed" || 
          err.message === "The username has already existed" ||
          err.response?.data?.includes("username already exists")) {
        setError("The username has already existed");
      } else {
        setError(err.response?.data || err.message || "Update failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account permanently?")) return;

    try {
      await API.delete(`/users/${user.id}`, {
        data: { username: user.username },
      });
      logout();
    } catch {
      setError("Failed to delete account");
    }
  };

  if (!user) {
    return <div className="settings">Please log in to view settings.</div>;
  }

  return (
    <div className="settings">
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsUpdateTitle">Update Your Account</span>
          <span className="settingsDeleteTitle" onClick={handleDelete}>
            Delete Account
          </span>
        </div>

        {error && <p className="errorMsg">{error}</p>}
        {success && <p className="successMsg">{success}</p>}
        {usernameChanged && (
          <div className="settingsWarning" style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "5px",
            marginBottom: "20px",
            color: "#856404"
          }}>
            <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
              ⚠️ Username Changed
            </p>
            <p style={{ margin: "0 0 10px 0" }}>
              Your username has been updated. To ensure all features work correctly 
              (including editing/deleting your posts), please log out and log back in.
            </p>
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ffc107",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Log Out Now
            </button>
          </div>
        )}

        <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Profile Picture</label>
          <div className="settingsPP">
            <img
              src={
                file
                  ? file instanceof File
                    ? URL.createObjectURL(file)
                    : file.preview
                  : getImageUrl("default-avatar.png")
              }
              alt="Profile"
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon fa-solid fa-camera"></i>
            </label>
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <label>Username</label>
          <input
            type="text"
            className="settingsInput"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            className="settingsInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password (optional)</label>
          <input
            type="password"
            className="settingsInput"
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="settingsSubmit" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
