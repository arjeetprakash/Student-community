import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://student-community-j7iy.onrender.com").replace(/\/$/, "");

export default function Dashboard() {
 const [posts, setPosts] = useState([]);
 const [title, setTitle] = useState("");
 const [content, setContent] = useState("");
 const [page, setPage] = useState(1);
 const [comment, setComment] = useState({});
 const [search, setSearch] = useState("");
 const [onlyMine, setOnlyMine] = useState(false);
 const [savedOnly, setSavedOnly] = useState(false);
 const [sortBy, setSortBy] = useState("latest");
 const [loading, setLoading] = useState(true);
 const [status, setStatus] = useState("");
 const [summary, setSummary] = useState(null);
 const [trendingTags, setTrendingTags] = useState([]);
 const [savedPosts, setSavedPosts] = useState([]);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 5, totalPages: 1 });

 const postsPerPage = 5;
 const role = localStorage.getItem("role");
 const username = localStorage.getItem("username");
 const token = localStorage.getItem("token");

 useEffect(() => {
  loadAuxiliary();
 }, []);

 useEffect(() => {
  loadPosts();
 }, [page, search, onlyMine, savedOnly, sortBy, savedPosts]);

 const loadAuxiliary = async () => {
  try {
   const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
   const [summaryRes, tagsRes, savedRes] = await Promise.all([
    axios.get(`${API_BASE_URL}/api/post/summary`, { headers: authHeaders }),
    axios.get(`${API_BASE_URL}/api/post/trending-tags?limit=8`),
    axios.get(`${API_BASE_URL}/api/post/saved`, { headers: authHeaders })
   ]);

   setSummary(summaryRes.data);
   setTrendingTags(tagsRes.data || []);
   setSavedPosts((savedRes.data?.savedPosts || []).map((id) => String(id)));
  } catch (err) {
   console.log("aux load error", err);
  }
 };

 const loadPosts = async () => {
  try {
   setLoading(true);

   const params = {
    page,
    limit: postsPerPage,
    q: search,
    sortBy,
    onlyMine,
    author: username
   };

   if (savedOnly && savedPosts.length > 0) {
    params.savedIds = savedPosts.join(",");
   }

   if (savedOnly && savedPosts.length === 0) {
    setPosts([]);
    setMeta({ total: 0, page: 1, limit: postsPerPage, totalPages: 1 });
    setLoading(false);
    return;
   }

   const res = await axios.get(`${API_BASE_URL}/api/post`, { params });
   setPosts(res.data?.data || []);
   setMeta(res.data?.meta || { total: 0, page: 1, limit: postsPerPage, totalPages: 1 });
  } catch (err) {
   setStatus("Could not load posts");
   console.log("load error", err);
  } finally {
   setLoading(false);
  }
 };

 const createPost = async () => {
  if (!title.trim() && !content.trim()) return;

  try {
   await axios.post(
    `${API_BASE_URL}/api/post`,
    {
     title,
     content,
     author: username,
     role: localStorage.getItem("role")
    },
    {
     headers: {
      Authorization: `Bearer ${token}`
     }
    }
   );

   setTitle("");
   setContent("");
   setStatus("Post published");
   setPage(1);
   await Promise.all([loadAuxiliary(), loadPosts()]);
  } catch (err) {
   setStatus("Post failed");
   console.log("post error", err);
  }
 };

 const likePost = async (id) => {
  try {
   await axios.put(
    `${API_BASE_URL}/api/post/like/${id}`,
    {},
    {
     headers: {
      Authorization: `Bearer ${token}`
     }
    }
   );

   loadPosts();
  } catch (err) {
   setStatus("Like failed");
   console.log("like error", err);
  }
 };

 const commentPost = async (id) => {
  if (!comment[id]?.trim()) return;

  try {
   await axios.post(
    `${API_BASE_URL}/api/post/comment/${id}`,
    {
     text: comment[id]
    },
    {
     headers: {
      Authorization: `Bearer ${token}`
     }
    }
   );

   setComment({
    ...comment,
    [id]: ""
   });

   setStatus("Comment added");
   loadPosts();
  } catch (err) {
   setStatus("Comment failed");
   console.log("comment error", err);
  }
 };

 const toggleSavePost = async (id) => {
  try {
   const res = await axios.put(
    `${API_BASE_URL}/api/post/save/${id}`,
    {},
    {
     headers: {
      Authorization: `Bearer ${token}`
     }
    }
   );

   setSavedPosts((res.data?.savedPosts || []).map((postId) => String(postId)));
   setStatus(res.data?.saved ? "Saved to your collection" : "Removed from saved collection");
  } catch (err) {
   setStatus("Save action failed");
   console.log("save error", err);
  }
 };

 const remainingChars = 240 - content.length;
 const dashboardStats = useMemo(() => {
  if (!summary) {
   return [
    { label: "Total Posts", value: "-" },
    { label: "Total Likes", value: "-" },
    { label: "Total Comments", value: "-" },
    { label: "Saved Posts", value: "-" }
   ];
  }

  return [
   { label: "Total Posts", value: summary.totalPosts },
   { label: "Total Likes", value: summary.totalLikes },
   { label: "Total Comments", value: summary.totalComments },
   { label: "Saved Posts", value: summary.savedPosts }
  ];
 }, [summary]);

 return (
  <div className="app-shell">
   <Navbar role={role} />

   <div className="hero dashboard-hero">
    <h1>Campus Pulse</h1>
    <p>Smarter feed controls, trending conversations, and your personal saved board.</p>
    {status && <div className="toast">{status}</div>}
   </div>

   <div className="grid dashboard-stats-grid">
    {dashboardStats.map((item) => (
     <div key={item.label} className="section-card stat-card">
      <small>{item.label}</small>
      <h2>{item.value}</h2>
     </div>
    ))}
   </div>

   <div className="section-card stack compose-card">
    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
     <input
      className="input"
      placeholder="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      style={{ flex: 1, minWidth: "200px" }}
     />
     <div className="chip">Signed in as {username || "anon"}</div>
    </div>

    <textarea
     className="input"
     placeholder="Share what is happening... use hashtags like #placements #hackathon"
     value={content}
     maxLength={240}
     onChange={(e) => setContent(e.target.value)}
     rows={4}
    />

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
     <small style={{ color: remainingChars < 20 ? "#dc2626" : "#475569" }}>
      {remainingChars} characters left
     </small>

     <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <button className="btn" onClick={createPost}>Post update</button>
      <button className="btn secondary" onClick={loadPosts}>Refresh</button>
     </div>
    </div>
   </div>

   <div className="section-card stack">
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
     <input
      className="input"
      placeholder="Search by title, content, author or #tag"
      value={search}
      onChange={(e) => {
       setSearch(e.target.value);
       setPage(1);
      }}
      style={{ flex: 1, minWidth: "220px" }}
     />

     <select
      className="input"
      value={sortBy}
      onChange={(e) => {
       setSortBy(e.target.value);
       setPage(1);
      }}
      style={{ maxWidth: 180 }}
     >
      <option value="latest">Latest</option>
      <option value="top">Top liked</option>
      <option value="discussed">Most discussed</option>
     </select>

     <label style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 600 }}>
      <input
       type="checkbox"
       checked={onlyMine}
       onChange={(e) => {
        setOnlyMine(e.target.checked);
        setPage(1);
       }}
      />
      My posts only
     </label>

     <label style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 600 }}>
      <input
       type="checkbox"
       checked={savedOnly}
       onChange={(e) => {
        setSavedOnly(e.target.checked);
        setPage(1);
       }}
      />
      Saved only
     </label>

     <div className="chip subtle">{meta.total} results</div>
    </div>

    {trendingTags.length > 0 && (
     <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {trendingTags.map((item) => (
       <button
        type="button"
        className="chip subtle"
        key={item.tag}
        onClick={() => {
         setSearch(`#${item.tag}`);
         setPage(1);
        }}
       >
        #{item.tag} ({item.count})
       </button>
      ))}
     </div>
    )}
   </div>

   {loading ? (
    <div className="grid">
     {[1, 2, 3].map((i) => (
      <div key={i} className="section-card skeleton" />
     ))}
    </div>
   ) : (
    <>
     {posts.length === 0 && (
      <div className="section-card" style={{ textAlign: "center" }}>
       <p>No posts match these filters yet.</p>
       <small>Try changing filters or start the conversation.</small>
      </div>
     )}

     <div className="grid">
      {posts.map((p) => (
       <div key={p._id} className="section-card feed-card">
        {p.isPinned && <div className="pin">Pinned highlight</div>}

        <h3>{p.title || "Untitled update"}</h3>
        <p>{p.content}</p>

        {!!p.tags?.length && (
         <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          {p.tags.map((tag) => (
           <span key={`${p._id}-${tag}`} className="chip subtle">
            #{tag}
           </span>
          ))}
         </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
         <small>{p.author}</small>
         <small>{new Date(p.createdAt).toLocaleString()}</small>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
         <button className="btn secondary" onClick={() => likePost(p._id)}>
          Like {p.likes?.length || 0}
         </button>

         <button className="btn secondary" onClick={() => toggleSavePost(p._id)}>
          {savedPosts.includes(String(p._id)) ? "Saved" : "Save"}
         </button>

         <div style={{ flex: 1, minWidth: "200px" }}>
          <input
           className="input"
           placeholder="Write comment..."
           value={comment[p._id] || ""}
           onChange={(e) =>
            setComment({
             ...comment,
             [p._id]: e.target.value
            })
           }
          />

          <button className="btn" style={{ marginTop: "8px" }} onClick={() => commentPost(p._id)}>
           Add comment
          </button>
         </div>
        </div>

        {p.comments?.length > 0 && (
         <div className="comments">
          {p.comments.slice(0, 3).map((c) => (
           <div key={c._id} className="comment-line">
            <span>Comment:</span>
            <span>{c.text}</span>
           </div>
          ))}
          {p.comments.length > 3 && <small>+{p.comments.length - 3} more comments</small>}
         </div>
        )}
       </div>
      ))}
     </div>

     <Pagination
      totalItems={meta.total}
      itemsPerPage={meta.limit}
      currentPage={meta.page}
      setCurrentPage={setPage}
     />
    </>
   )}
  </div>
 );
}
