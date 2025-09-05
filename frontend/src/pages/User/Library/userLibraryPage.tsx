import React, { useCallback } from "react";
import { Card, Typography, Button, Skeleton, message } from "antd";
import { RightOutlined, BookOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks } from "../../../services/https/book";
import type { Book } from "../../../interfaces/Book";
import type { Author } from "../../../interfaces/Author";
import type { Publisher } from "../../../interfaces/Publisher";

const { Title, Text } = Typography;
const { Meta } = Card;

// Constants
const BACKEND_URL = "http://localhost:8088";
const CARD_WIDTH = 200;
const IMAGE_HEIGHT = 280;

// Utility functions
const getAuthorName = (author: Author): string => {
  return author.name || "Unknown";
};

const getAuthorsDisplay = (authors?: Author[]): string => {
  if (!authors || authors.length === 0) return "Unknown Author";
  return authors.map(getAuthorName).join(", ");
};

const getPublisherName = (publisher?: Publisher): string => {
  if (!publisher) return "Unknown Publisher";
  return publisher.name || "Unknown Publisher";
};

const getImageUrl = (coverImage?: string | null): string => {
  if (!coverImage) return "/placeholder-cover.jpg";
  return `${BACKEND_URL}${coverImage}`;
};

const mapApiResponseToBook = (item: any): Book => ({
  ID: item.ID || item.id,
  title: item.title || item.Title || "Untitled",
  coverImage: item.CoverImage || item.cover_image || item.image,
  authors: item.Authors || item.authors || [],
  publisher: item.Publisher || item.publisher,
  language: item.Language || item.language,
  synopsis: item.Description || item.description,
  isbn: item.ISBN || item.isbn,
  total_pages: item.TotalPages || item.total_pages,
});

// Sub-components
const BookCardImage: React.FC<{ book: Book }> = ({ book }) => (
  <div style={{ height: IMAGE_HEIGHT, overflow: "hidden" }}>
    <img
      alt={book.title}
      src={getImageUrl(book.coverImage)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/placeholder-cover.jpg";
      }}
    />
  </div>
);

const BookCardContent: React.FC<{ book: Book }> = ({ book }) => (
  <Meta
    title={
      <Text 
        ellipsis={{ tooltip: book.title }} 
        style={{ fontSize: "14px", fontWeight: "600" }}
      >
        {book.title}
      </Text>
    }
    description={
      <div>
        <Text 
          type="secondary" 
          style={{ fontSize: "12px" }}
          ellipsis
        >
          {getAuthorsDisplay(book.authors)}
        </Text>
        <br />
        <Text 
          type="secondary" 
          style={{ fontSize: "11px" }}
        >
          {getPublisherName(book.publisher)}
          {book.isbn && ` • ${book.isbn}`}
        </Text>
      </div>
    }
  />
);

const BookCard: React.FC<{ 
  book: Book; 
  onCardClick: (id: number) => void; 
}> = ({ book, onCardClick }) => (
  <Card
    key={book.ID}
    hoverable
    style={{ 
      width: CARD_WIDTH, 
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      cursor: "pointer"
    }}
    onClick={() => onCardClick(book.ID)}
    cover={<BookCardImage book={book} />}
  >
    <BookCardContent book={book} />
  </Card>
);

const EmptyState: React.FC = () => (
  <div style={{ 
    width: "100%", 
    textAlign: "center", 
    padding: "60px 20px",
    color: "#999"
  }}>
    <BookOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
    <Title level={4} style={{ color: "#999" }}>No books available</Title>
    <Text type="secondary">Please check back later</Text>
  </div>
);

const LoadingState: React.FC<{ contextHolder: React.ReactElement }> = ({ contextHolder }) => (
  <div
    style={{
      padding: "24px",
      background: "#ffffff",
      height: "100%",
      width: "100%",
      fontFamily: "Kanit, sans-serif",
    }}
  >
    {contextHolder}
    <Card>
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </Card>
  </div>
);

const HeaderSection: React.FC = () => (
  <div style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "24px" 
  }}>
    <Title level={2} style={{ 
      margin: 0, 
      fontFamily: "Kanit, sans-serif", 
      color: "#FF8A00" 
    }}>
      S-Library
    </Title>
    <Button 
      type="link" 
      icon={<RightOutlined />}
      style={{ color: "#FF8A00" }}
    >
      See All
    </Button>
  </div>
);

export default function UserLibrary() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Handlers
  const handleBookClick = useCallback((bookId: number) => {
    navigate(`/user/library/book/${bookId}`);
  }, [navigate]);

  const handleShowError = useCallback((content: string) => {
    messageApi.open({
      type: "error",
      content,
    });
  }, [messageApi]);

  // API calls
  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllBooks();
      
      if (!response || !Array.isArray(response)) {
        setBooks([]);
        handleShowError("Failed to load books data");
        return;
      }

      const mappedBooks = response.map(mapApiResponseToBook);
      setBooks(mappedBooks);
    } catch (error) {
      console.error("Failed to load books:", error);
      setBooks([]);
      handleShowError("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [handleShowError]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Render loading state
  if (loading) {
    return <LoadingState contextHolder={contextHolder} />;
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "#f5f5f5",
        minHeight: "100vh",
        fontFamily: "Kanit, sans-serif",
      }}
    >
      {contextHolder}
      
      <HeaderSection />

      {/* Books Grid */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "flex-start"
      }}>
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard 
              key={book.ID} 
              book={book} 
              onCardClick={handleBookClick} 
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
} 