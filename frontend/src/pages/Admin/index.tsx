// src/pages/Dashboard/index.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Space, Skeleton, message } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import { bookAPI, bookAuthorAPI } from "../../services/https";
import type { Book } from "../../interfaces";

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_URL as string;

const categories = ["All","Sci-Fi","Fantasy","Drama","Business","Education","Geography","Psychology"];

/* ---------- Helpers ---------- */
const getId = (b: any) => b?.ID ?? b?.id;
const getCreatedAt = (b: any) => b?.CreatedAt ?? b?.created_at ?? b?.createdAt ?? null;
const getTitle = (b: any) => b?.Title ?? b?.title ?? b?.Name ?? b?.name ?? "Untitled";
const getCoverPath = (b: any) =>
  b?.CoverImage ?? b?.cover_image ?? b?.coverUrl ?? b?.cover_url ?? b?.CoverURL ?? null;

const getCoverUrl = (b: any): string | null => {
  const p = getCoverPath(b);
  if (!p || typeof p !== "string") return null;
  return p.startsWith("http") ? p : `${API}${p}`;
};

const getAuthorName = (b: any) => {
  if (typeof b?.author_names === "string" && b.author_names.trim() !== "") return b.author_names;
  if (typeof b?.AuthorNames === "string" && b.AuthorNames.trim() !== "") return b.AuthorNames;

  const a = b?.Author ?? b?.author;
  if (a && (a.Name || a.name)) return a.Name ?? a.name;

  const arr = b?.Authors ?? b?.authors;
  if (Array.isArray(arr) && arr.length) {
    const names = arr.map((x: any) => x?.Name ?? x?.name).filter(Boolean);
    if (names.length) return names.join(", ");
  }

  const piv = b?.BookAuthors ?? b?.book_authors ?? b?.bookAuthors;
  if (Array.isArray(piv) && piv.length) {
    const names = piv
      .map((ba: any) => ba?.Author?.Name ?? ba?.Author?.name ?? ba?.author?.Name ?? ba?.author?.name)
      .filter(Boolean);
    if (names.length) return names.join(", ");
  }
  return "—";
};

/* ----- file type helpers ----- */
const normalizeType = (s: string) => {
  const t = s.trim().toLowerCase();
  if (t.includes("epub")) return "E-PUB";
  if (t.includes("pdf")) return "PDF";
  return s.toUpperCase();
};

const getFileTypeLabel = (b: any): string | null => {
  const raw =
    b?.FileType?.TypeName ??
    b?.file_type?.type_name ??
    b?.TypeName ??
    b?.type_name ??
    b?.file_type_name ??
    null;
  return typeof raw === "string" && raw.trim() ? normalizeType(raw) : null;
};
/* ---------------------------- */

/* ---------- Styles ---------- */
const hScroll: React.CSSProperties = {
  display: "flex",
  flexWrap: "nowrap",
  gap: 46,
  overflowX: "auto",
  padding: "4px 2px 8px 2px",
  scrollSnapType: "x proximity",
  WebkitOverflowScrolling: "touch",
};
const hScrollCat: React.CSSProperties = {
  ...hScroll,
  gap: 85,
};
const item: React.CSSProperties = { flex: "0 0 auto", scrollSnapAlign: "start" };
const card160: React.CSSProperties = {
  width: 160,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};
const card120: React.CSSProperties = {
  width: 120,
  borderRadius: 16,
  overflow: "hidden",
  border: "none",
};

// Placeholder เมื่อไม่มีปก
const noCoverBoxLg: React.CSSProperties = {
  height: 220, width: "100%",
  background: "#fff7e6",
  border: "1px dashed #ffa940",
  borderRadius: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const noCoverBoxSm: React.CSSProperties = { ...noCoverBoxLg, height: 160 };
const noCoverText: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "#fa8c16",
  display: "flex", alignItems: "center", gap: 8,
};
const badgeNoCover: React.CSSProperties = {
  position: "absolute", top: 8, left: 8,
  background: "#faad14", color: "#fff",
  fontSize: 10, padding: "2px 8px", borderRadius: 999,
  boxShadow: "0 1px 4px rgba(0,0,0,.15)",
};

/* สีและสไตล์ปุ่ม See All (ให้เหมือน Back) */
const ORANGE = "#f57c00";
const backBtnBase: React.CSSProperties = {
  backgroundColor: "#fff",
  color: ORANGE,
  borderColor: ORANGE,
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 999,
  transition: "all .2s ease",
};
const backBtnHover: React.CSSProperties = {
  ...backBtnBase,
  backgroundColor: ORANGE,
  color: "#fff",
};

/* ป้ายชนิดไฟล์ */
const typeBadgeStyle = (label: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 16,
  backgroundColor: label === "PDF" ? "#e53935" : label === "E-PUB" ? "#43a047" : "#555",
  color: "#fff",
  fontWeight: 500,
  fontSize: 11,
  lineHeight: "14px",
  padding: "1px 6px",
  borderRadius: 4,
  boxShadow: "0 2px 6px rgba(0,0,0,.15)",
  letterSpacing: 0.3,
});

const typeBadgeStyleCat = (label: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 15,
  padding: "0.5px 3px",
  borderRadius: 4,
  fontSize: 8,
  lineHeight: "14px",
  fontWeight: 500,
  backgroundColor: label === "PDF" ? "#e53935" : label === "E-PUB" ? "#43a047" : "#555",
  color: "#fff",
  letterSpacing: 0.3,
  boxShadow: "0 1px 3px rgba(0,0,0,.18)",
});
/* ---------------------------- */

/* ---------- Renderers ---------- */
const RenderCoverLarge = ({ book }: { book: any }) => {
  const url = getCoverUrl(book);
  const typeLabel = getFileTypeLabel(book);
  if (!url) {
    return (
      <div style={{ position: "relative" }}>
        <div style={noCoverBoxLg}>
          <span style={noCoverText}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16v14H4z" stroke="#fa8c16" strokeWidth="2" />
              <path d="M4 15l4-4 4 4 3-3 5 5" stroke="#fa8c16" strokeWidth="2" />
            </svg>
            NO COVER
          </span>
        </div>
        <span style={badgeNoCover}>NO COVER</span>
        {typeLabel && <span style={typeBadgeStyle(typeLabel)}>{typeLabel}</span>}
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <img
        alt={getTitle(book)}
        src={url}
        style={{ height: 220, width: "100%", objectFit: "cover" }}
        onError={(e) => {
          const parent = e.currentTarget.parentElement;
          if (!parent) return;
          parent.innerHTML = "";
          const holder = document.createElement("div");
          holder.style.position = "relative";
          const box = document.createElement("div");
          Object.assign(box.style, noCoverBoxLg);
          box.innerHTML = `<span style="font-size:12px;font-weight:700;color:#fa8c16;display:flex;align-items:center;gap:8px;">NO COVER</span>`;
          const badge = document.createElement("span");
          Object.assign(badge.style, badgeNoCover as any);
          badge.textContent = "NO COVER";
          holder.appendChild(box);
          holder.appendChild(badge);
          parent.appendChild(holder);
        }}
      />
      {typeLabel && <span style={typeBadgeStyle(typeLabel)}>{typeLabel}</span>}
    </div>
  );
};

const RenderCoverSmall = ({ book }: { book: any }) => {
  const url = getCoverUrl(book);
  const typeLabel = getFileTypeLabel(book);
  if (!url) {
    return (
      <div style={{ position: "relative" }}>
        <div style={noCoverBoxSm}>
          <span style={noCoverText}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16v14H4z" stroke="#fa8c16" strokeWidth="2" />
              <path d="M4 15l4-4 4 4 3-3 5 5" stroke="#fa8c16" strokeWidth="2" />
            </svg>
            NO COVER
          </span>
        </div>
        <span style={badgeNoCover}>NO COVER</span>
        {typeLabel && <span style={typeBadgeStyleCat(typeLabel)}>{typeLabel}</span>}
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <img
        alt={getTitle(book)}
        src={url}
        style={{ height: 160, width: "100%", objectFit: "cover", borderRadius: 16 }}
        onError={(e) => {
          const parent = e.currentTarget.parentElement;
          if (!parent) return;
          parent.innerHTML = "";
          const holder = document.createElement("div");
          holder.style.position = "relative";
          const box = document.createElement("div");
          Object.assign(box.style, noCoverBoxSm);
          box.innerHTML = `<span style="font-size:12px;font-weight:700;color:#fa8c16;display:flex;align-items:center;gap:8px;">NO COVER</span>`;
          const badge = document.createElement("span");
          Object.assign(badge.style, badgeNoCover as any);
          badge.textContent = "NO COVER";
          holder.appendChild(box);
          holder.appendChild(badge);
          parent.appendChild(holder);
        }}
      />
      {typeLabel && <span style={typeBadgeStyleCat(typeLabel)}>{typeLabel}</span>}
    </div>
  );
};
/* ------------------------------ */

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<Book[]>([]);       // Recently Added (ใหม่→เก่า)
  const [catBooks, setCatBooks] = useState<Book[]>([]); // Categories (เก่า→ใหม่)
  const [seeAllHover, setSeeAllHover] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await bookAPI.getAll();
        const data: any[] = Array.isArray(res) ? res : res?.data;
        if (!alive) return;
        if (!Array.isArray(data)) throw new Error("รูปแบบข้อมูลหนังสือไม่ใช่ array");

        const needMerge = !data.some((b) => typeof b?.author_names === "string");
        let withAuthorNames = data;

        if (needMerge) {
          const bas = await bookAuthorAPI.findAll();
          const map = new Map<number, string[]>();
          (bas || []).forEach((x: any) => {
            const bid = x?.book_id ?? x?.BookID ?? x?.Book?.ID ?? x?.Book?.id;
            const name = x?.Author?.Name ?? x?.Author?.name ?? x?.author?.Name ?? x?.author?.name;
            if (!bid || !name) return;
            if (!map.has(bid)) map.set(bid, []);
            map.get(bid)!.push(name);
          });
          withAuthorNames = data.map((b: any) => {
            const id = getId(b);
            const names = map.get(Number(id));
            return names && names.length ? { ...b, author_names: names.join(", ") } : b;
          });
        }

        const sortedDesc = [...withAuthorNames].sort((a, b) => {
          const ta = getCreatedAt(a) ? new Date(getCreatedAt(a)!).getTime() : Number(getId(a) || 0);
          const tb = getCreatedAt(b) ? new Date(getCreatedAt(b)!).getTime() : Number(getId(b) || 0);
          return (tb || 0) - (ta || 0);
        });
        setBooks(sortedDesc.slice(0, 30));

        const sortedAsc = [...withAuthorNames].sort((a, b) => {
          const ta = getCreatedAt(a) ? new Date(getCreatedAt(a)!).getTime() : Number(getId(a) || 0);
          const tb = getCreatedAt(b) ? new Date(getCreatedAt(b)!).getTime() : Number(getId(b) || 0);
          return (ta || 0) - (tb || 0);
        });
        setCatBooks(sortedAsc.slice(0, 40));
      } catch (e) {
        console.error(e);
        message.error("โหลดหนังสือไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const gridBooks = useMemo(() => catBooks.slice(0, 40), [catBooks]);

  return (
    <div style={{ padding: 0 }}>
      {/* Recently Added */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: "#0D1A26" }}>Recently Added</Title>
          <Link to="/admin/book/recent">
            <Button
              type="default"
              onMouseEnter={() => setSeeAllHover(true)}
              onMouseLeave={() => setSeeAllHover(false)}
              style={seeAllHover ? backBtnHover : backBtnBase}
            >
              See All <RightOutlined />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="no-scrollbar" style={hScroll}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={item}>
                <Card style={card160} cover={<Skeleton.Image active style={{ width: "100%", height: 220 }} />}>
                  <Skeleton active paragraph={false} title={{ width: "80%" }} />
                  <Skeleton active paragraph={{ rows: 0 }} title={{ width: "50%" }} />
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-scrollbar" style={hScroll}>
            {books.map((book: any, idx) => (
              <div key={getId(book) ?? idx} style={item}>
                <Link to={`/admin/book/detail/${getId(book)}`}>
                  <Card
                    hoverable
                    bodyStyle={{ padding: "12px 16px" }}
                    style={card160}
                    cover={<RenderCoverLarge book={book} />}
                  >
                    <Title
                      level={5}
                      style={{ fontSize: 14, margin: 0, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {getTitle(book)}
                    </Title>
                    <Text
                      type="secondary"
                      ellipsis={{ tooltip: getAuthorName(book) }}
                      style={{ fontSize: 12 }}
                    >
                      {getAuthorName(book)}
                    </Text>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: "#0D1A26" }}>Categories</Title>
        </div>

        <Space wrap size={[20, 16]} style={{ marginBottom: 24 }}>
          {categories.map((cat) => (
            <span
              key={cat}
              style={{
                padding: "6px 20px",
                fontSize: 14,
                borderRadius: 999,
                fontWeight: cat === "All" ? 600 : 500,
                color: cat === "All" ? "#fff" : "#070E45",
                backgroundColor: cat === "All" ? "#fa8c16" : "#fff2e8",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              {cat}
            </span>
          ))}
        </Space>

        {loading ? (
          <div className="no-scrollbar" style={hScrollCat}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={item}>
                <Card style={card120} cover={<Skeleton.Image active style={{ width: "100%", height: 160 }} />}>
                  <Skeleton active paragraph={false} title={{ width: "80%" }} />
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-scrollbar" style={hScrollCat}>
            {gridBooks.map((book: any, idx) => (
              <div key={getId(book) ?? idx} style={item}>
                <Link to={`/admin/book/detail/${getId(book)}`}>
                  <Card
                    hoverable
                    bodyStyle={{ padding: "8px" }}
                    style={card120}
                    cover={<RenderCoverSmall book={book} />}
                  >
                    <Title
                      level={5}
                      style={{ fontSize: 14, margin: 0, marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {getTitle(book)}
                    </Title>
                    <Text
                      type="secondary"
                      ellipsis={{ tooltip: getAuthorName(book) }}
                      style={{ fontSize: 12 }}
                    >
                      {getAuthorName(book)}
                    </Text>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
