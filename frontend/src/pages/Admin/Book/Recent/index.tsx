// src/pages/book/recent/index.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Skeleton, message, Pagination } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import { bookAPI, bookAuthorAPI, fileTypeAPI } from "../../../../services/https/book";
import type { Book } from "../../../../interfaces";

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_URL as string;

const PAGE_SIZE = 24;

/* ---------- Helpers ---------- */
const getId = (b: any) => b?.ID ?? b?.id;
const getCreatedAt = (b: any) =>
  b?.CreatedAt ?? b?.created_at ?? b?.createdAt ?? null;
const getTitle = (b: any) =>
  b?.Title ?? b?.title ?? b?.Name ?? b?.name ?? "Untitled";
const getCoverPath = (b: any) =>
  b?.CoverImage ??
  b?.cover_image ??
  b?.coverUrl ??
  b?.cover_url ??
  b?.CoverURL ??
  null;

const getCoverUrl = (b: any): string | null => {
  const p = getCoverPath(b);
  if (!p || typeof p !== "string") return null;
  return p.startsWith("http") ? p : `${API}${p}`;
};

const getAuthorName = (b: any) => {
  if (typeof b?.author_names === "string" && b.author_names.trim() !== "")
    return b.author_names;
  if (typeof b?.AuthorNames === "string" && b.AuthorNames.trim() !== "")
    return b.AuthorNames;

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
      .map(
        (ba: any) =>
          ba?.Author?.Name ??
          ba?.Author?.name ??
          ba?.author?.Name ??
          ba?.author?.name
      )
      .filter(Boolean);
    if (names.length) return names.join(", ");
  }
  return "—";
};

/* ----- file type helpers (อ่านจากตาราง/ฟิลด์ที่มีอยู่แล้ว) ----- */
const normalizeType = (s: string) => {
  const t = s.trim().toLowerCase();
  if (t.includes("epub")) return "E-PUB";
  if (t.includes("pdf")) return "PDF";
  return s.toUpperCase();
};

const getFileTypeLabel = (
  b: any,
  map: Record<number, string>
): string | null => {
  // ชื่อชนิดไฟล์ที่มากับ object อยู่แล้ว (ทั้ง nested/flatten)
  const raw =
    b?.FileType?.TypeName ??
    b?.file_type?.type_name ??
    b?.TypeName ??
    b?.type_name ??
    b?.file_type_name ??
    null;
  if (typeof raw === "string" && raw.trim()) return normalizeType(raw);

  // ถ้าไม่มีชื่อแต่มี id → lookup จาก map
  const id = b?.file_type_id ?? b?.FileTypeID;
  if (id != null && map[id]) return normalizeType(map[id]);

  return null;
};
/* ------------------------------------------- */

/* ---------- Styles ---------- */
const ORANGE = "#f57c00";

const pageWrap: React.CSSProperties = { padding: 0 };
const CARD_WIDTH = 170;

const containerStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  marginTop: 0,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const gridWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
  gap: 70,
  justifyContent: "center",
};

const CARD_HEIGHT = 315;
const COVER_HEIGHT = 240;

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
  padding: "12px 16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 4,
  flex: 1,
};

const noCoverBox: React.CSSProperties = {
  height: COVER_HEIGHT,
  width: "100%",
  background: "#fff7e6",
  border: "1px dashed #ffa940",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const noCoverText: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#fa8c16",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

// ปุ่ม Back
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

/* ---------- Type badge ---------- */
const TypeBadge = ({ label }: { label: string }) => {
  const bg = label === "PDF" ? "#e53935" : label === "E-PUB" ? "#43a047" : "#555";
  return (
    <span
      style={{
        position: "absolute",
        top: 0,
        left: 16,
        backgroundColor: bg,
        color: "#fff",
        fontWeight: 500,
        fontSize: 11,
        lineHeight: "14px",
        padding: "1px 6px",
        borderRadius: 4,
        boxShadow: "0 2px 6px rgba(0,0,0,.15)",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
};
/* ------------------------------------------- */

const Cover = ({
  book,
  typeMap,
}: {
  book: any;
  typeMap: Record<number, string>;
}) => {
  const url = getCoverUrl(book);
  const typeLabel = getFileTypeLabel(book, typeMap);

  if (!url) {
    return (
      <div style={{ position: "relative", padding: 8 }}>
        <div style={noCoverBox}>
          <span style={noCoverText}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16v14H4z" stroke="#fa8c16" strokeWidth="2" />
              <path d="M4 15l4-4 4 4 3-3 5 5" stroke="#fa8c16" strokeWidth="2" />
            </svg>
            NO COVER
          </span>
        </div>
        {typeLabel && <TypeBadge label={typeLabel} />}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: COVER_HEIGHT,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <img
        alt={getTitle(book)}
        src={url}
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
        onError={(e) => {
          const parent = e.currentTarget.parentElement;
          if (!parent) return;
          parent.innerHTML = "";
          const holder = document.createElement("div");
          holder.style.position = "relative";
          const box = document.createElement("div");
          Object.assign(box.style, noCoverBox);
          box.innerHTML = `<span style="font-size:12px;font-weight:700;color:#fa8c16;display:flex;align-items:center;gap:8px;">NO COVER</span>`;
          holder.appendChild(box);
          parent.appendChild(holder);
        }}
      />
      {typeLabel && <TypeBadge label={typeLabel} />}
    </div>
  );
};

const RecentlyAdded = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isBackHover, setIsBackHover] = useState<boolean>(false);
  const [typeMap, setTypeMap] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // โหลดหนังสือ + ชนิดไฟล์ พร้อมกัน
        const [resBooks, resTypes] = await Promise.all([
          bookAPI.getAll(),
          fileTypeAPI.getAll(),
        ]);

        // ทำ map id → ชื่อชนิดไฟล์
        const map: Record<number, string> = {};
        const rawTypes: any[] = Array.isArray(resTypes)
          ? resTypes
          : resTypes?.data || [];
        (rawTypes || []).forEach((t: any) => {
          const id = Number(t?.ID ?? t?.id);
          const name = String(t?.TypeName ?? t?.type_name ?? "");
          if (id && name) map[id] = name;
        });
        if (alive) setTypeMap(map);

        // จัดการหนังสือ
        const data: any[] = Array.isArray(resBooks) ? resBooks : resBooks?.data;
        if (!alive) return;
        if (!Array.isArray(data))
          throw new Error("Books response is not an array");

        // รวมชื่อผู้แต่งถ้ายังไม่มีใน response
        const needMerge = !data.some(
          (b) => typeof b?.author_names === "string"
        );
        let withAuthorNames = data;

        if (needMerge) {
          const bas = await bookAuthorAPI.findAll();
          const m = new Map<number, string[]>();
          (bas || []).forEach((x: any) => {
            const bid =
              x?.book_id ?? x?.BookID ?? x?.Book?.ID ?? x?.Book?.id;
            const name =
              x?.Author?.Name ??
              x?.Author?.name ??
              x?.author?.Name ??
              x?.author?.name;
            if (!bid || !name) return;
            if (!m.has(bid)) m.set(bid, []);
            m.get(bid)!.push(name);
          });
          withAuthorNames = data.map((b: any) => {
            const id = getId(b);
            const names = m.get(Number(id));
            return names && names.length
              ? { ...b, author_names: names.join(", ") }
              : b;
          });
        }

        const sortedDesc = [...withAuthorNames].sort((a, b) => {
          const ta = getCreatedAt(a)
            ? new Date(getCreatedAt(a)!).getTime()
            : Number(getId(a) || 0);
          const tb = getCreatedAt(b)
            ? new Date(getCreatedAt(b)!).getTime()
            : Number(getId(b) || 0);
          return (tb || 0) - (ta || 0);
        });

        setBooks(sortedDesc);
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
  }, []);

  const total = books.length;
  const pageBooks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return books.slice(start, start + PAGE_SIZE);
  }, [books, page]);

  return (
    <div style={pageWrap}>
      <div style={containerStyle}>
        {/* หัวข้อและปุ่ม Back */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Title level={3} style={{ margin: 10, marginBottom: 0 }}>
            Recently Added
          </Title>
          <Button
            type="default"
            icon={<LeftOutlined />}
            onClick={() => navigate(-1)}
            onMouseEnter={() => setIsBackHover(true)}
            onMouseLeave={() => setIsBackHover(false)}
            style={isBackHover ? backBtnHover : backBtnBase}
          >
            Back
          </Button>
        </div>
        <Text
          type="secondary"
          style={{ display: "block", marginLeft: 10, marginBottom: 24 }}
        >
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
                    cover={<Cover book={book} typeMap={typeMap} />}
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

export default RecentlyAdded;