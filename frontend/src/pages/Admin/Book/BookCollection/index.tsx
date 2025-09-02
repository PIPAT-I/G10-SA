// src/pages/Admin/Book/BookCollection/index.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Skeleton, message, Pagination } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  bookAPI,
  bookAuthorAPI,
  authorAPI,
  publisherAPI,
} from "../../../../services/https";
import type { Book } from "../../../../interfaces";

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_URL as string;

const PAGE_SIZE = 24;
const ORANGE = "#f57c00";

/* ---------- Helpers ---------- */
const getId = (b: any) => b?.ID ?? b?.id;
const getTitle = (b: any) =>
  b?.Title ?? b?.title ?? b?.Name ?? b?.name ?? "Untitled";
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
  const arr = b?.Authors ?? b?.authors;
  if (Array.isArray(arr) && arr.length) {
    const names = arr
      .map((x: any) => x?.AuthorName ?? x?.author_name ?? x?.Name ?? x?.name)
      .filter(Boolean);
    if (names.length) return names.join(", ");
  }
  const piv = b?.BookAuthors ?? b?.book_authors ?? b?.bookAuthors;
  if (Array.isArray(piv) && piv.length) {
    const names = piv
      .map(
        (ba: any) =>
          ba?.Author?.AuthorName ??
          ba?.Author?.Name ??
          ba?.author?.AuthorName ??
          ba?.author?.Name
      )
      .filter(Boolean);
    if (names.length) return names.join(", ");
  }
  return "—";
};

/* ----- file type helpers (เหมือน Dashboard) ----- */
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
/* ------------------------------------------------ */

/* ---------- Styles ---------- */
const pageWrap: React.CSSProperties = { padding: 0 };
const CARD_WIDTH = 170;
const COVER_HEIGHT = 240;
const CARD_HEIGHT = 315;

const containerStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  marginTop: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
const gridWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
  gap: 70,
  justifyContent: "center",
};
const cardStyle: React.CSSProperties = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
};
const cardBodyStyle: React.CSSProperties = {
  padding: "4px 12px 16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 4,
  flex: 1,
};
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

/* ป้ายชนิดไฟล์ (เหมือน Dashboard) */
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

/* Placeholder เมื่อไม่มีปก (ให้โชว์ badge ได้ด้วย) */
const noCoverBox: React.CSSProperties = {
  height: COVER_HEIGHT,
  width: "100%",
  background: "#fff7e6",
  border: "1px dashed #ffa940",
  borderRadius: 16,
};

/* ---------- Cover + typeBadge ---------- */
const Cover = ({ book }: { book: any }) => {
  const url = getCoverUrl(book);
  const typeLabel = getFileTypeLabel(book);

  if (!url) {
    return (
      <div style={{ position: "relative" }}>
        <div style={noCoverBox} />
        {typeLabel && <span style={typeBadgeStyle(typeLabel)}>{typeLabel}</span>}
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <img
        alt={getTitle(book)}
        src={url}
        style={{ height: COVER_HEIGHT, width: "100%", objectFit: "cover" }}
      />
      {typeLabel && <span style={typeBadgeStyle(typeLabel)}>{typeLabel}</span>}
    </div>
  );
};

/* ---------- Page (author / publisher only) ---------- */
const BookCollection = () => {
  const { mode, id } = useParams<{ mode: string; id?: string }>();
  const [search] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [hoverBack, setHoverBack] = useState(false);
  const [heading, setHeading] = useState("Books");
  const navigate = useNavigate();

  // Dynamic heading: Author: NAME / Publisher: NAME
  useEffect(() => {
    let alive = true;
    (async () => {
      const manual = search.get("title");
      if (manual) {
        if (alive) setHeading(manual);
        return;
      }
      const m = (mode || "").toLowerCase();
      if (!id || !["author", "publisher"].includes(m)) {
        if (alive) setHeading("Books");
        return;
      }
      try {
        const nid = Number(id);
        if (m === "author") {
          const r = await authorAPI.getById(nid);
          const name = r?.author_name ?? r?.AuthorName ?? r?.name ?? "";
          if (alive) setHeading(name ? `Author: ${name}` : "Author");
        } else if (m === "publisher") {
          const r = await publisherAPI.getById(nid);
          const name = r?.publisher_name ?? r?.PublisherName ?? r?.name ?? "";
          if (alive) setHeading(name ? `Publisher: ${name}` : "Publisher");
        }
      } catch {
        if (alive) setHeading((mode || "").toLowerCase() === "author" ? "Author" : "Publisher");
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, id, search]);

  // Load & filter only by author/publisher
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await bookAPI.getAll();
        let data: any[] = Array.isArray(res) ? res : res?.data;
        if (!Array.isArray(data)) data = [];

        // ถ้าข้อมูลผู้แต่งไม่ติดมาด้วย → รวมจาก pivot เพื่อใช้กรอง/โชว์
        const hasAuthorNames = data.some(
          (b) => typeof b?.author_names === "string" || Array.isArray(b?.authors) || Array.isArray(b?.Authors)
        );
        let bookToAuthorIds = new Map<number, number[]>();
        if (!hasAuthorNames) {
          const bas = await bookAuthorAPI.findAll();
          (bas || []).forEach((x: any) => {
            const bid = x?.book_id ?? x?.BookID ?? x?.Book?.ID ?? x?.Book?.id;
            const aid =
              x?.author_id ?? x?.AuthorID ?? x?.Author?.ID ?? x?.Author?.id ?? x?.author?.ID ?? x?.author?.id;
            if (!bid || !aid) return;
            if (!bookToAuthorIds.has(bid)) bookToAuthorIds.set(bid, []);
            bookToAuthorIds.get(bid)!.push(Number(aid));
          });
          // แปะ author_names จาก pivot ถ้ามี
          const namesMap = new Map<number, string[]>();
          (bas || []).forEach((x: any) => {
            const bid = x?.book_id ?? x?.BookID ?? x?.Book?.ID ?? x?.Book?.id;
            const aname =
              x?.Author?.AuthorName ??
              x?.Author?.Name ??
              x?.author?.AuthorName ??
              x?.author?.Name ??
              "";
            if (bid && aname) {
              if (!namesMap.has(bid)) namesMap.set(bid, []);
              namesMap.get(bid)!.push(aname);
            }
          });
          data = data.map((b) => {
            const bid = Number(getId(b));
            const names = namesMap.get(bid);
            return names?.length ? { ...b, author_names: names.join(", ") } : b;
          });
        }

        const m = (mode || "").toLowerCase();
        const nid = Number(id);
        const filtered = data.filter((b) => {
          if (m === "publisher") {
            return String(b?.publisher_id ?? b?.PublisherID) === String(nid);
          }
          if (m === "author") {
            const arr = b.authors ?? b.Authors;
            if (Array.isArray(arr)) {
              return arr.some((x: any) => Number(x?.id ?? x?.ID) === nid);
            }
            const fromMap = bookToAuthorIds.get(Number(getId(b))) || [];
            return fromMap.includes(nid);
          }
          return true;
        });

        // เรียงชื่อหนังสือให้คงที่
        const sorted = [...filtered].sort((a, b) =>
          String(getTitle(a)).localeCompare(String(getTitle(b)))
        );

        if (alive) setBooks(sorted);
      } catch (e) {
        console.error(e);
        message.error("Failed to load books");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, id]);

  const total = books.length;
  const pageBooks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return books.slice(start, start + PAGE_SIZE);
  }, [books, page]);

  return (
    <div style={pageWrap}>
      <div style={containerStyle}>
        {/* Header + Back */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {heading}
          </Title>
          <Button
            type="default"
            icon={<LeftOutlined />}
            onClick={() => navigate(-1)}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
            style={hoverBack ? backBtnHover : backBtnBase}
          >
            Back
          </Button>
        </div>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          {total} results
        </Text>

        {loading ? (
          <div style={gridWrap}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Card
                key={i}
                style={cardStyle}
                cover={
                  <Skeleton.Image
                    active
                    style={{ width: "100%", height: COVER_HEIGHT }}
                  />
                }
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div style={gridWrap}>
              {pageBooks.map((book: any, idx) => (
                <Link
                  key={getId(book) ?? idx}
                  to={`/admin/book/detail/${getId(book)}`}
                >
                  <Card
                    hoverable
                    style={cardStyle}
                    bodyStyle={cardBodyStyle}
                    cover={<Cover book={book} />}
                  >
                    <Title
                      level={5}
                      style={{
                        fontSize: 14,
                        margin: 0,
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
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
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                showSizeChanger={false}
                onChange={(p) => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setPage(p);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookCollection;
