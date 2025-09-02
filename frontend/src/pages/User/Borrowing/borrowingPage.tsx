import { Card, Button, Typography, Row, Col, Tag } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock data
const books = [
  {
    id: 1,
    bookTitle: "React Programming Guide",
    author: "Neque porro quisquam",
    borrowDate: "2025-07-20",
    dueDate: "2025-08-20",
    daysLeft: 15,
  },
  {
    id: 2,
    bookTitle: "TypeScript Handbook",
    author: "Neque porro quisquam",
    borrowDate: "2025-07-25",
    dueDate: "2025-08-25",
    daysLeft: 3,
  },
  {
    id: 3,
    bookTitle: "Clean Code Principles",
    author: "Neque porro quisquam",
    borrowDate: "2025-07-15",
    dueDate: "2025-08-15",
    daysLeft: 5,
  },
];

export default function BorrowingPage() {
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  const handleReturnBook = (book: any) => {
    console.log("Return book:", book.bookTitle);
  };

  // Handle browse library button click
  const handleBrowseLibrary = () => {
    console.log("Navigate to library");
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        minHeight: "100vh",
        fontFamily: "Kanit, sans-serif",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: "24px",
          padding: "24px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#1f1f1f",
              fontSize: "28px",
              fontWeight: 500,
              fontFamily: "Kanit, sans-serif",
            }}
          >
            My Borrowing
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: "16px",
              marginTop: "8px",
              display: "block",
              fontWeight: 300,
              fontFamily: "Kanit, sans-serif",
            }}
          >
            Manage your borrowed books and due dates
          </Text>
        </div>
        <Button
          type="primary"
          icon={<BookOutlined />}
          size="large"
          onClick={handleBrowseLibrary}
          style={{
            height: "44px",
            padding: "0 20px",
            borderRadius: "8px",
            fontWeight: 400,
            fontFamily: "Kanit, sans-serif",
            background: "#FF8A00",
          }}
        >
          Browse Library
        </Button>
      </div>

      {/* Borrowing List */}
      <Row gutter={[0, 16]}>
        {books.map((book) => (
          <Col span={24} key={book.id}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f0f0",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ display: "flex" }}>
                {/* Book Cover */}
                <div
                  style={{
                    width: "160px",
                    height: "220px",
                    background: "linear-gradient(135deg, #FF8A00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <BookOutlined style={{ fontSize: "48px", opacity: 0.8 }} />
                </div>

                {/* Book Information */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Book Title and Status */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Title
                          level={4}
                          style={{
                            margin: "0 0 4px 0",
                            color: "#1f1f1f",
                            fontSize: "20px",
                            fontWeight: 500,
                            lineHeight: "1.3",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          {book.bookTitle}
                        </Title>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "15px",
                            fontWeight: 300,
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          by {book.author}
                        </Text>
                      </div>
                      <Tag
                        color="success"
                        style={{
                          borderRadius: "16px",
                          padding: "4px 12px",
                          border: "none",
                          fontWeight: 400,
                          fontFamily: "Kanit, sans-serif",
                        }}
                      >
                        Borrowed
                      </Tag>
                    </div>

                    {/* Date Information */}
                    <div
                      style={{
                        display: "flex",
                        gap: "34px",
                        marginBottom: "20px",
                        padding: "16px",
                        background: "#f9f9f9",
                        borderRadius: "10px",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <div>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            letterSpacing: "0.5px",
                            display: "block",
                            marginBottom: "4px",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          Date Borrowed
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#666",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          {formatDate(book.borrowDate)}
                        </Text>
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            letterSpacing: "0.5px",
                            display: "block",
                            marginBottom: "4px",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          Due Date
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#666",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          {formatDate(book.dueDate)}
                        </Text>
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            letterSpacing: "0.5px",
                            display: "block",
                            marginBottom: "4px",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          Days Left
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#52c41a",
                            fontFamily: "Kanit, sans-serif",
                          }}
                        >
                          {book.daysLeft < 0
                            ? `${Math.abs(book.daysLeft)} overdue`
                            : `${book.daysLeft} days`}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Return Book Button */}
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <Button
                      type="primary"
                      onClick={() => handleReturnBook(book)}
                      style={{
                        height: "40px",
                        padding: "0 20px",
                        borderRadius: "20px",
                        fontWeight: 400,
                        background: "#FF8A00",
                        borderColor: "#FF8A00",
                        fontFamily: "Kanit, sans-serif",
                      }}
                    >
                      Return Book
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
