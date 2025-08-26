import { Typography } from "antd";

const { Title } = Typography;

const ReadingActivityPage = () => {
    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
                    Reading Activity
                </Title>
                <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
                    Reading Activity User Page
                </p>
            </div>
        </div>
    );
};

export default ReadingActivityPage;
