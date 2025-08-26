import { Typography } from "antd";

const { Title } = Typography;

export default function IssueAdminPage() {
    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: "24px" }}>
                <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
                    Issue Management
                </Title>
                <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
                    Issue Admin Page
                </p>
            </div>
        </div>
    );
}
