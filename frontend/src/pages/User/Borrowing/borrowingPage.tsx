import { Typography } from "antd";

const { Title } = Typography;

export default function BorrowingUserPage() {
    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: "24px" }}>
                <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
                    My Borrowing
                </Title>
                <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
                    Borrowing User Page
                </p>
            </div>
        </div>
    );
}