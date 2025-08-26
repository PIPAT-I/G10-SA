import { Typography, Card, Row, Col, List } from 'antd';


const { Title } = Typography;

export default function UserDashboard() {
  return(
    <div>
      <Title level={2} style={{ marginBottom: '24px', fontFamily: 'Kanit' }}>
        User Dashboard
      </Title>
       <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}
       >Welcome to user dashboard</p>
    </div>
  )
}