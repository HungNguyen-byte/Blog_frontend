//src/constants.js
export const getImageUrl = (publicIdOrUrl) => {
  if (!publicIdOrUrl) return "https://via.placeholder.com/300x200?text=No+Image";

  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  return `https://res.cloudinary.com/dee27nbof/image/upload/${publicIdOrUrl}`;
};
