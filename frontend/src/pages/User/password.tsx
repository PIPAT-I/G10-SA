import { Card, Form, Input, Button, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

const ChangePasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onChangePassword = async (values: any) => {
    try {
      setLoading(true);
      // ตัวอย่าง API call
      // await api.changePassword(values);

      console.log("Change password:", values);
      message.success("Password changed successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Failed to change password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 500,
        width: "100%",
        borderRadius: 20,
        padding: 30,
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        margin: "auto",
      }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Change Password
      </Title>

      <Form
        form={form}
        name="change_password"
        onFinish={onChangePassword}
        layout="vertical"
        requiredMark={false}
        size="large"
      >
        <Form.Item
          label={<Text style={{ fontSize: 16, fontWeight: 500 }}>Old Password</Text>}
          name="old_password"
          rules={[{ required: true, message: "Please input your Old Password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="Old Password"
            style={{ height: 48, borderRadius: 15 }}
          />
        </Form.Item>

        <Form.Item
          label={<Text style={{ fontSize: 16, fontWeight: 500 }}>New Password</Text>}
          name="new_password"
          rules={[{ required: true, message: "Please input your New Password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="New Password"
            style={{ height: 48, borderRadius: 15 }}
          />
        </Form.Item>

        <Form.Item
          label={<Text style={{ fontSize: 16, fontWeight: 500 }}>Confirm Password</Text>}
          name="confirm_password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="Confirm Password"
            style={{ height: 48, borderRadius: 15 }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ height: 48, borderRadius: 15, fontSize: 16 }}
            loading={loading}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordForm;
