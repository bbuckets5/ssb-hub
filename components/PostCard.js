// components/PostCard.js
import './PostCard.css';

export default function PostCard({ post }) {
  // A helper to format the date
  const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="post-card">
      <div className="post-author-info">
        <span className={`post-author-username ${post.author.community}-text`}>
          {post.author.username}
        </span>
        <span className="post-timestamp">· {postDate}</span>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button className="action-button">
          <i className="far fa-heart"></i>
          <span>{post.likes}</span>
        </button>
        {/* We can add other buttons like comments later */}
      </div>
    </div>
  );
}
