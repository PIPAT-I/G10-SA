import React from "react";
import {
  Card,
  Avatar,
  Typography,
  Input,
  Button,
  Divider,
  Space,
  Form,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ProfilePage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          width: 500,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
        headStyle={{
          paddingBottom: 24,
          borderBottom: "1px solid #f0f0f0",
        }}
        title={
          <Space align="center" size={16}>
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Text strong style={{ fontSize: 18 }}>
                Your Name
              </Text>
              <br />
              <Text type="secondary">yourname@gmail.com</Text>
            </div>
          </Space>
        }
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          {/* First Name */}
          <Form.Item
            label={<Text style={{ fontSize: "15px", fontWeight: 500 }}>First Name</Text>}
            name="firstname"
            rules={[{ required: true, message: "Please input your First Name!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Enter First Name"
              style={{
                height: "46px",
                fontSize: "15px",
                backgroundColor: "#F1F3F6",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          {/* Last Name */}
          <Form.Item
            label={<Text style={{ fontSize: "15px", fontWeight: 500 }}>Last Name</Text>}
            name="lastname"
            rules={[{ required: true, message: "Please input your Last Name!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Enter Last Name"
              style={{
                height: "46px",
                fontSize: "15px",
                backgroundColor: "#F1F3F6",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={<Text style={{ fontSize: "15px", fontWeight: 500 }}>Email</Text>}
            name="email"
            rules={[{ required: true, message: "Please input your Email!" }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Enter Email"
              style={{
                height: "46px",
                fontSize: "15px",
                backgroundColor: "#F1F3F6",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          {/* Mobile */}
          <Form.Item
            label={<Text style={{ fontSize: "15px", fontWeight: 500 }}>Mobile Number</Text>}
            name="mobile"
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Add Mobile Number"
              style={{
                height: "46px",
                fontSize: "15px",
                backgroundColor: "#F1F3F6",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          {/* User ID */}
          <Form.Item
            label={<Text style={{ fontSize: "15px", fontWeight: 500 }}>User ID</Text>}
            name="user_id"
          >
            <Input
              prefix={<IdcardOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="User ID"
              disabled
              style={{
                height: "46px",
                fontSize: "15px",
                backgroundColor: "#E5E7EB",
                borderRadius: "10px",
                color: "#555",
              }}
            />
          </Form.Item>

          {/* Save Button */}
          <Form.Item>
            <Button
              type="primary"
              block
              style={{
                height: "48px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 500,
                transition: "all 0.3s",
              }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
