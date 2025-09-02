// src/pages/Admin/Book/Detail/index.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Divider,
  message,
  Skeleton,
  Popconfirm,
} from "antd";
import { CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { bookAPI, bookAuthorAPI } from "../../../../services/https";

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_URL as string;
const ORANGE = "#f57c00";

/* ---------------- Helpers ---------------- */
const get = (o: any, keys: string[], fallback: any = undefined) => {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null) return o[k];
  }
  return fallback;
};
const getTitle = (b: any) => get(b, ["Title", "title", "Name", "name"], "Untitled");
const getSynopsis = (b: any) => get(b, ["Synopsis", "synopsis"], "");
const getPages = (b: any) =>
  get(b, ["TotalPage", "total_page", "TotalPages", "total_pages", "totalPages"], 0);
const getIsbn = (b: any) => get(b, ["ISBN", "isbn"], "—");
const getYear = (b: any) => get(b, ["PublishedYear", "published_year", "publishedYear"], 0);

type IdName = { id?: number; name: string };

/** ดึงสำนักพิมพ์ (id + name) รองรับได้ทั้งแบบ nested/flatten */
const getPublisherInfo = (b: any): IdName => {
  const pub = get(b, ["publisher", "Publisher"], null);
  if (pub && typeof pub === "object") {
    const id = get(pub, ["ID", "id"], undefined);
    const name = get(pub, ["PublisherName", "publisher_name", "Name", "name"], "—");
    return { id: id ? Number(id) : undefined, name };
  }
  const id = get(b, ["publisher_id", "PublisherID"], undefined);
  const name = get(b, ["publisher_name", "PublisherName", "publisherName"], "—");
  return { id: id ? Number(id) : undefined, name };
};

/** ภาษา (ไว้แสดงเฉย ๆ) */
const getLanguageName = (b: any) => {
  const lang = get(b, ["language", "Language"], null);
  if (lang && typeof lang === "object") {
    return get(lang, ["Name", "name", "LanguageName", "language_name"], "—");
  }
  return get(b, ["language_name", "LanguageName", "languageName", "language"], "—");
};

const getCoverPath = (b: any) =>
  get(b, ["CoverImage", "cover_image", "coverUrl", "cover_url", "CoverURL"], undefined);

const getCoverUrl = (b: any): string | null => {
  const p = getCoverPath(b);
  if (!p || typeof p !== "string") return null;
  return p.startsWith("http") ? p : `${API}${p}`;
};

/** รวมผู้แต่งจาก field ต่าง ๆ พร้อม id ถ้ามี */
const extractAuthors = (b: any): IdName[] => {
  const out: IdName[] = [];

  // 1) array Authors
  const arr = get(b, ["Authors", "authors"], []);
  if (Array.isArray(arr)) {
    arr.forEach((a: any) => {
      const id = get(a, ["ID", "id"], undefined);
      const name = get(a, ["AuthorName", "author_name", "Name", "name"], undefined);
      if (name) out.push({ id: id ? Number(id) : undefined, name: String(name) });
    });
  }

  // 2) single Author
  const one = get(b, ["Author", "author"], undefined);
  if (one && typeof one === "object") {
    const id = get(one, ["ID", "id"], undefined);
    const name = get(one, ["AuthorName", "author_name", "Name", "name"], undefined);
    if (name) out.push({ id: id ? Number(id) : undefined, name: String(name) });
  }

  // 3) pivot BookAuthors
  const piv = get(b, ["BookAuthors", "book_authors", "bookAuthors"], []);
  if (Array.isArray(piv)) {
    piv.forEach((ba: any) => {
      const id =
        get(ba, ["AuthorID", "author_id"], undefined) ??
        get(ba?.Author, ["ID", "id"], undefined) ??
        get(ba?.author, ["ID", "id"], undefined);
      const name =
        get(ba?.Author, ["AuthorName", "author_name", "Name", "name"], undefined) ??
        get(ba?.author, ["AuthorName", "author_name", "Name", "name"], undefined);
      if (name) out.push({ id: id ? Number(id) : undefined, name: String(name) });
    });
  }

  // 4) ถ้าไม่มี id เลย แต่อยู่ใน author_names (string)
  if (!out.length) {
    const merged = get(b, ["author_names", "AuthorNames"], "").trim();
    if (merged) {
      merged
        .split(",")
        .map((s: string) => s.trim())
        .filter((x: string) => x.length > 0)
        .forEach((nm: string) => out.push({ name: nm }));
    }
  }

  // de-dup by id หรือชื่อ
  const seen = new Set<string>();
  return out.filter(({ id, name }) => {
    const key = id ? `id:${id}` : `name:${name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* --------- ชนิดไฟล์ (ใช้สไตล์เดียวกับ Dashboard) --------- */
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
const typeBadgeStyle = (label: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 18,
  backgroundColor:
    label === "PDF" ? "#e53935" : label === "E-PUB" ? "#43a047" : "#555",
  color: "#fff",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "16px",
  padding: "2px 8px",
  borderRadius: 4,
  boxShadow: "0 2px 6px rgba(0,0,0,.15)",
  letterSpacing: 0.3,
});
/* ----------------------------------------------------------- */

/* --------- ลิงก์แบบข้อความ (สีปกติ, hover เป็นส้ม) --------- */
function LinkText({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span className="bc-textlink" onClick={onClick}>
      {children}
    </span>
  );
}

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState<any>(null);
  const [authors, setAuthors] = useState<IdName[]>([]);
  const [authorNames, setAuthorNames] = useState<string>("—");
  const [loading, setLoading] = useState<boolean>(true);

  const [delHover, setDelHover] = useState(false);
  const deleteRed = "#ff4d4f";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const bid = Number(id);
        if (!bid) throw new Error("invalid id");

        const data = await bookAPI.getById(bid);
        if (!alive) return;
        setBook(data);

        const fromBook = extractAuthors(data);
        if (fromBook.length) {
          setAuthors(fromBook);
          setAuthorNames(fromBook.map((a) => a.name).join(", "));
        } else {
          const bas = await bookAuthorAPI.findAll({ book_id: bid });
          const list: IdName[] = (Array.isArray(bas) ? bas : bas?.data || [])
            .map((x: any) => {
              const id = get(x, ["author_id", "AuthorID"], undefined);
              const name =
                get(x, ["AuthorName", "author_name", "Name", "name"], undefined) ??
                get(x?.Author, ["AuthorName", "author_name", "Name", "name"], undefined) ??
                get(x?.author, ["AuthorName", "author_name", "Name", "name"], undefined);
              return name ? { id: id ? Number(id) : undefined, name: String(name) } : undefined;
            })
            .filter(Boolean) as IdName[];
          if (list.length) {
            setAuthors(list);
            setAuthorNames(list.map((a) => a.name).join(", "));
          } else {
            setAuthors([]);
            setAuthorNames("—");
          }
        }
      } catch (e) {
        console.error(e);
        message.error("Failed to load book");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const coverUrl = useMemo(() => (book ? getCoverUrl(book) : null), [book]);
  const typeLabel = useMemo(() => (book ? getFileTypeLabel(book) : null), [book]);

  const goCollection = (mode: "author" | "publisher", entityId?: number) => {
    if (!entityId) return;
    navigate(`/admin/book/collection/${mode}/${entityId}`);
  };

  const handleEdit = () => navigate(`/admin/book/edit/${id}`);
  const handleClose = () => navigate(-1);

  const handleDelete = async () => {
    try {
      const bid = Number(id);
      const res = await bookAPI.delete(bid);
      if (res?.status && res.status !== 200) throw new Error("Delete failed");
      if (res?.error) throw new Error(res.error);

      message.success("Book deleted");
      navigate(-1);
    } catch (e) {
      console.error(e);
      message.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, background: "#fff", borderRadius: 20 }}>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ padding: 32, background: "#fff", borderRadius: 20 }}>
        <Title level={4}>Book not found</Title>
        <Button onClick={handleClose}>Back</Button>
      </div>
    );
  }

  const publisher = getPublisherInfo(book);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        gap: 40,
        padding: 32,
        backgroundColor: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* CSS สำหรับลิงก์แบบข้อความ */}
      <style>{`
        .bc-textlink {
          color: inherit;
          cursor: pointer;
          text-decoration: none;
        }
        .bc-textlink:hover {
          color: ${ORANGE};
        }
      `}</style>

      {/* Close (X) */}
      <Button
        type="text"
        shape="circle"
        icon={<CloseOutlined />}
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 36,
          height: 36,
          fontSize: 18,
          color: "#999",
          zIndex: 10,
        }}
      />

      {/* Cover + Type Badge */}
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          width: 350,
          height: 520,
          marginTop: 26,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          background: "#fff7e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={getTitle(book)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Text strong type="secondary">
            NO COVER
          </Text>
        )}
        {typeLabel && <span style={typeBadgeStyle(typeLabel)}>{typeLabel}</span>}
      </div>

      {/* Detail */}
      <div style={{ flex: 1 }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          {getTitle(book)}
        </Title>

        {/* by Authors */}
        <Text type="secondary">
          by{" "}
          {authors.length
            ? authors.map((a, idx) => (
                <span key={`${a.id ?? a.name}-${idx}`}>
                  {a.id ? (
                    <LinkText onClick={() => goCollection("author", a.id)}>
                      {a.name}
                    </LinkText>
                  ) : (
                    <span>{a.name}</span>
                  )}
                  {idx < authors.length - 1 ? ", " : ""}
                </span>
              ))
            : authorNames}
        </Text>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Button
            onClick={handleEdit}
            icon={<EditOutlined />}
            style={{
              backgroundColor: "#faad14",
              color: "#fff",
              fontWeight: 600,
              padding: "0 26px",
              borderRadius: 12,
              height: 40,
              minWidth: 100,
            }}
          >
            Edit
          </Button>

          <Popconfirm
            placement="bottomLeft"
            title="Delete this book?"
            description="Are you sure you want to delete this book? This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button
              type="default"
              danger
              ghost
              aria-label="delete book"
              icon={<DeleteOutlined />}
              onMouseEnter={() => setDelHover(true)}
              onMouseLeave={() => setDelHover(false)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderColor: deleteRed,
                backgroundColor: delHover ? deleteRed : "transparent",
                color: delHover ? "#fff" : deleteRed,
                transition: "all .15s ease-in-out",
              }}
            />
          </Popconfirm>
        </div>

        <Divider />

        <Title level={5}>Synopsis</Title>
        <Text style={{ whiteSpace: "pre-wrap", fontSize: 16 }}>
          {getSynopsis(book) || "—"}
        </Text>

        <Divider />

        <Title level={5} style={{ marginBottom: 16 }}>
          About the Book
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 16,
            columnGap: 48,
          }}
        >
          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              Author
            </Text>
            {authors.length ? (
              <Text strong>
                {authors.map((a, idx) => (
                  <span key={`${a.id ?? a.name}-about-${idx}`}>
                    {a.id ? (
                      <LinkText onClick={() => goCollection("author", a.id)}>
                        {a.name}
                      </LinkText>
                    ) : (
                      <span>{a.name}</span>
                    )}
                    {idx < authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Text>
            ) : (
              <Text strong>{authorNames}</Text>
            )}
          </div>

          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              Publisher
            </Text>
            <Text strong>
              {publisher.id ? (
                <LinkText
                  onClick={() => goCollection("publisher", publisher.id)}
                >
                  {publisher.name || "—"}
                </LinkText>
              ) : (
                publisher.name || "—"
              )}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              Publication Year
            </Text>
            <Text strong>{getYear(book) || "—"}</Text>
          </div>

          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              Language
            </Text>
            <Text strong>{getLanguageName(book) || "—"}</Text>
          </div>

          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              Pages
            </Text>
            <Text strong>{getPages(book) || "—"}</Text>
          </div>

          <div>
            <Text strong style={{ display: "block", color: "#A0A0A0" }}>
              ISBN
            </Text>
            <Text strong>{getIsbn(book) || "—"}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
