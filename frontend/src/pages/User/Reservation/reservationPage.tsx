import { Card, Button, Typography, Row, Col, Tag } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock data
const mockBookings = [
  {
    id: 1,
    bookTitle: "Advanced React Patterns",
    author: "Kent C. Dodds",
    reservationDate: "2025-08-05",
    queue: 30,
    yourQueue: 12,
    status: "waiting",
  },
  {
    id: 2,
    bookTitle: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    reservationDate: "2025-08-03",
    queue: 15,
    yourQueue: 4,
    status: "waiting",
  },
  {
    id: 3,
    bookTitle: "Clean Code Architecture",
    author: "Robert C. Martin",
    reservationDate: "2025-08-01",
    queue: 8,
    yourQueue: 0,
    status: "ready",
  },
];

export default function ReservationPage() {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAction = (booking: any) => {
    console.log("Action clicked for booking:", booking.id);
  };

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
            My Reservations
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
            Track your book reservations and queue status
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

      {/* Reservations List */}
      <Row gutter={[0, 16]}>
        {mockBookings.map((booking: any) => {
          return (
            <Col span={24} key={booking.id}>
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
                      flexShrink: 0,
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
                    {/* Header with status */}
                    <div>
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
                            {booking.bookTitle}
                          </Title>
                          <Text
                            style={{
                              color: "#666",
                              fontSize: "15px",
                              fontWeight: 300,
                              fontFamily: "Kanit, sans-serif",
                            }}
                          >
                            by {booking.author}
                          </Text>
                        </div>
                      </div>

                      {/* Queue Information */}
                      <div
                        style={{
                          display: "flex",
                          gap: "32px",
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
                            Reservation Date
                          </Text>
                          <Text
                            style={{
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#666",
                              fontFamily: "Kanit, sans-serif",
                            }}
                          >
                            {formatDate(booking.reservationDate)}
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
                            Queue Position
                          </Text>
                          <Text
                            style={{
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#666",
                              fontFamily: "Kanit, sans-serif",
                            }}
                          >
                            {booking.yourQueue + 1} of {booking.queue}
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
                            Status
                          </Text>
                          <Tag
                            color="success"
                            style={{
                              borderRadius: "16px",
                              padding: "4px 8px",
                              border: "none",
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#52c41a",
                              fontFamily: "Kanit, sans-serif",
                            }}
                          >
                            {booking.status === "ready" ||
                            booking.yourQueue === 0
                              ? "Ready to Borrow"
                              : "In Queue"}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div
                      style={{ display: "flex", justifyContent: "flex-start" }}
                    >
                      <Button
                        type="primary"
                        onClick={() => handleAction(booking)}
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
                        {booking.status === "ready" || booking.yourQueue === 0
                          ? "Borrow Now"
                          : "Cancel Reservation"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
