import { Typography, Card, Empty } from "antd";

const { Title, Text } = Typography;

const IssuePage = () => {
    return (
        <Card 
            className="main-page-card"
            title={
                <div>
                    <Title level={2} style={{ color: "#FF8A00", margin: 0, fontFamily: "Kanit, sans-serif" }}>
                        Issues
                    </Title>
                    <Text style={{ color: "#6B7280", fontFamily: "Kanit, sans-serif" }}>
                        Issue User Page
                    </Text>
                </div>
            }
            bodyStyle={{ 
                padding: "32px", 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Empty 
                    description={
                        <Text style={{ fontFamily: "Kanit, sans-serif", color: "#999" }}>
                            No issues reported
                        </Text>
                    }
                />
            </div>
        </Card>
    );
};

export default IssuePage;
