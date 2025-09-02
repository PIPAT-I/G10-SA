import { Card, Typography, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { books } from "../../../interfaces/Book";


const { Title, Text } = Typography;

export default function UserLibrary() {
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
        {books.map((b) => (
          <Card
            key={b.id}
            className="ra-card"
            hoverable
            cover={<img src={b.cover} alt={b.title} className="ra-cover" />}
            bodyStyle={{ padding: 12 }}
          >
            <Text className="ra-title-text" ellipsis={{ tooltip: b.title }}>
              {b.title}
            </Text>
            <br />
            <Text
              type="secondary"
              className="ra-author"
              ellipsis={{ tooltip: b.author }}
            >
              {b.author}
            </Text>
          </Card>
        ))}
        </div>
      </div>
      </Card>
    </div>
  );
} 