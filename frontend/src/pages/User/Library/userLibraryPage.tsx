import { Card, Typography, Button, Skeleton, message } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getAllBooks } from "../../../services/https/book";

const { Title, Text } = Typography;

export default function UserLibrary() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getAllBooks();
        if (!alive) return;
        
        // รับข้อมูลมาแล้ว map เอา
        const booksData = Array.isArray(res) ? res : [];
        setBooks(booksData.slice(0, 8)); // เอาแค่ 8 เล่มแรก
        
      } catch (error) {
        console.error("Failed to load books:", error);
        message.error("Failed to load books");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          background: "#ffffff",
          height: "100%",
          width: "100%",
          fontFamily: "Kanit, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Card>
          <Skeleton active />
        </Card>
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        height: "100%",
        width: "100%",
        fontFamily: "Kanit, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Title level={2} style={{ margin: 0, fontFamily: "Kanit, sans-serif", color: "#FF8A00" }}>
              Library
            </Title>
            <Button
              type="primary"
              size="large"
              icon={<RightOutlined />}
              style={{
                fontFamily: "Kanit, sans-serif",
                backgroundColor: "#FF8A00",
                borderColor: "#FF8A00"
              }}
            >
              See All Books
            </Button>
          </div>
        }
        bodyStyle={{
          padding: "32px",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}
      >
      <div className="ra-grid" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100%"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          flex: 1
        }}>
        {books.map((book, index) => (
          <Card
            key={book.ID || index}
            className="ra-card"
            hoverable
            cover={<img src={book.CoverImage || "/placeholder-cover.jpg"} alt={book.Title} className="ra-cover" />}
            bodyStyle={{ padding: 12 }}
          >
            <Text className="ra-title-text" ellipsis={{ tooltip: book.Title }}>
              {book.Title || "Untitled"}
            </Text>
            <br />
            <Text
              type="secondary"
              className="ra-author"
              ellipsis={{ tooltip: "Author" }}
            >
              Author Name
            </Text>
          </Card>
        ))}
        </div>
      </div>
      </Card>
    </div>
  );
} 