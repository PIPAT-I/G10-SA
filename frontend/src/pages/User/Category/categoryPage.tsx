import { Typography } from "antd";

const { Title } = Typography;

const CategoryPage = () => {
    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
                    Categories
                </Title>
                <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
                    Category User Page
                </p>
            </div>
        </div>
    );
};

export default CategoryPage;