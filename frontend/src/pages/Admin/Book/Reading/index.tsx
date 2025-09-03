import React, { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Typography, Input, Spin, message, Empty } from "antd";
import {
  CloseOutlined,
  BookOutlined,
  HighlightOutlined,
  DownloadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { bookAPI, bookAuthorAPI } from "../../../../services/https/book";

const { Text } = Typography;
const { TextArea } = Input;

/* ====== กำหนดความกว้างเลนกลางให้ทุกส่วนใช้เหมือนกัน ====== */
const READER_WIDTH = 980;
const laneStyle: React.CSSProperties = {
  width: `min(${READER_WIDTH}px, calc(100% - 48px))`,
  margin: "0 auto",
};

const topBarStyle: React.CSSProperties = {
  position: "fixed",
  top: 24,
  left: "50%",
  transform: "translateX(-50%)",
  width: `min(${READER_WIDTH}px, calc(100% - 48px))`,
  background: "#ffffff",
  borderRadius: 16,
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  boxShadow: "0 10px 24px rgba(0,0,0,.12)",
  zIndex: 10,
  transition: "opacity .2s ease, transform .2s ease",
};

const bottomBarStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 24,
  left: "50%",
  transform: "translateX(-50%)",
  width: `min(${READER_WIDTH}px, calc(100% - 48px))`,
  background: "#ffffff",
  borderRadius: 16,
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  boxShadow: "0 10px 24px rgba(0,0,0,.12)",
  zIndex: 10,
  transition: "opacity .2s ease, transform .2s ease",
};

const API = import.meta.env.VITE_API_URL as string;
const ORANGE = "#fa8c16";

/* ---------------- Helpers ---------------- */
const getTitle = (b: any) => b?.Title ?? b?.title ?? "Untitled";
const getCoverPath = (b: any) =>
  b?.CoverImage ?? b?.cover_image ?? b?.coverUrl ?? b?.cover_url ?? b?.CoverURL ?? null;
const getCoverUrl = (b: any): string | null => {
  const p = getCoverPath(b);
  if (!p || typeof p !== "string") return null;
  return p.startsWith("http") ? p : `${API}${p}`;
};
const getEbookPath = (b: any) => b?.EbookFile ?? b?.ebook_file ?? b?.ebook ?? null;
const getEbookUrl = (b: any): string | null => {
  const p = getEbookPath(b);
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
/* ----------------------------------------- */

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [showUI, setShowUI] = useState(true);

  // Note แยกตามเล่ม
  const NOTE_KEY = useMemo(() => `reading_note_text:${id ?? "unknown"}`, [id]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState<string>(
    localStorage.getItem(NOTE_KEY) || ""
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) throw new Error("missing id");
        setLoading(true);

        const b = await bookAPI.getById(Number(id));

        if (!b?.author_names) {
          try {
            const bas = await bookAuthorAPI.findAll({ book_id: Number(id) });
            const rows: any[] = Array.isArray(bas) ? bas : bas?.data || [];
            const names = rows
              .map((x: any) => x?.Author?.Name ?? x?.Author?.name ?? x?.author?.Name ?? x?.author?.name)
              .filter(Boolean);
            if (names.length) b.author_names = names.join(", ");
          } catch {}
        }

        if (alive) setBook(b);
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถโหลดข้อมูลหนังสือได้");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const ebookUrl = useMemo(() => (book ? getEbookUrl(book) : null), [book]);
  const coverUrl = useMemo(() => (book ? getCoverUrl(book) : null), [book]);
  const title = useMemo(() => (book ? getTitle(book) : "Loading…"), [book]);
  const authors = useMemo(() => (book ? getAuthorName(book) : "—"), [book]);

  const fileExt = (ebookUrl || "").toLowerCase();
  const isPDF = fileExt.endsWith(".pdf") || fileExt.includes("application/pdf");
  const isEPUB = fileExt.endsWith(".epub");

  const handleSaveNote = () => {
    localStorage.setItem(NOTE_KEY, noteText);
    message.success("บันทึกโน้ตแล้ว");
    setNoteOpen(false);
  };

  const readerHeight = "calc(100vh - 210px)";

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* แถบบน */}
      <div
        style={{
          ...topBarStyle,
          opacity: showUI ? 1 : 0,
          transform: showUI
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(-10px)",
          pointerEvents: showUI ? "auto" : "none",
        }}
      >
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: "50%", color: ORANGE }}
        />
        <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <Text strong style={{ display: "block" }} ellipsis>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {authors}
          </Text>
        </div>
        <Button
          type="text"
          icon={<BookOutlined />}
          style={{ width: 36, height: 36, borderRadius: "50%", color: ORANGE }}
        />
      </div>

      {/* เลนกลาง */}
      <div style={{ paddingTop: 80, paddingBottom: 90 }}>
        <div style={{ ...laneStyle }}>
          {loading ? (
            <div
              style={{
                height: "calc(100vh - 210px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin size="large" />
            </div>
          ) : !ebookUrl ? (
            <div
              onClick={() => setShowUI((s) => !s)}
              style={{
                height: readerHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #eee",
              }}
            >
              <Empty
                description={
                  <div>
                    <div>ยังไม่มีไฟล์ E-Book สำหรับเล่มนี้</div>
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt="cover"
                        style={{
                          marginTop: 12,
                          height: 140,
                          width: "auto",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </div>
                }
              />
            </div>
          ) : isPDF ? (
            <div
              onClick={() => setShowUI((s) => !s)}
              style={{
                height: readerHeight,
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #eee",
              }}
            >
              <iframe
                title="pdf-reader"
                src={`${ebookUrl}#toolbar=1&navpanes=0`}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ) : isEPUB ? (
            <div
              onClick={() => setShowUI((s) => !s)}
              style={{
                height: readerHeight,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                textAlign: "center",
                padding: 24,
              }}
            >
              <img
                src={coverUrl || undefined}
                alt=""
                style={{ height: 140, width: "auto", borderRadius: 8, marginBottom: 8 }}
              />
              <Text>
                ไฟล์ชนิด <b>EPUB</b> ไม่สามารถอ่านตรงในเบราว์เซอร์ได้
              </Text>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  href={ebookUrl}
                  target="_blank"
                  style={{ background: ORANGE, borderColor: ORANGE }}
                >
                  เปิดในแท็บใหม่
                </Button>
                <Button icon={<DownloadOutlined />} href={ebookUrl} download>
                  ดาวน์โหลดไฟล์
                </Button>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                แนะนำให้เปิดด้วยแอปอ่าน ePub เช่น Apple Books / Google Play Books
              </Text>
            </div>
          ) : (
            <div
              onClick={() => setShowUI((s) => !s)}
              style={{
                height: readerHeight,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                textAlign: "center",
                padding: 24,
              }}
            >
              <Text>ไม่รองรับไฟล์ชนิดนี้</Text>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  href={ebookUrl}
                  target="_blank"
                  style={{ background: ORANGE, borderColor: ORANGE }}
                >
                  เปิดในแท็บใหม่
                </Button>
                <Button icon={<DownloadOutlined />} href={ebookUrl} download>
                  ดาวน์โหลดไฟล์
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* แถบล่าง */}
      <div
        style={{
          ...bottomBarStyle,
          opacity: showUI ? 1 : 0,
          transform: showUI
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(10px)",
          pointerEvents: showUI ? "auto" : "none",
        }}
      >
        <Button
          shape="round"
          icon={<HighlightOutlined />}
          onClick={() => setNoteOpen(true)}
          style={{ borderRadius: 9999, paddingInline: 16 }}
        >
          Note
        </Button>

        <div style={{ display: "flex", gap: 8 }}>
          {ebookUrl && (
            <>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                href={ebookUrl}
                target="_blank"
                style={{ background: ORANGE, borderColor: ORANGE }}
              >
                เปิดในแท็บใหม่
              </Button>
              <Button icon={<DownloadOutlined />} href={ebookUrl} download>
                ดาวน์โหลด
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Drawer โน้ต */}
      <Drawer
        title="Note"
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        width={Math.min(420, window.innerWidth - 64)}
        styles={{
          content: { borderRadius: 20, overflow: "hidden", marginRight: 12 },
          header: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
          body: { padding: 16 },
          footer: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setNoteOpen(false)}>Close</Button>
            <Button type="primary" onClick={handleSaveNote}>
              Save
            </Button>
          </div>
        }
      >
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #eaeaea",
            borderRadius: 16,
            padding: 12,
          }}
        >
          <TextArea
            rows={10}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="- พิมพ์บันทึกของคุณที่นี่"
            bordered={false}
            style={{ resize: "vertical" }}
          />
        </div>
      </Drawer>
    </div>
  );
}