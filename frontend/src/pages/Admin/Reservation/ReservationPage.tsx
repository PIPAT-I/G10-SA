import { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Space, Button, message, Modal, Descriptions } from "antd";
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

// 📋 Interface สำหรับข้อมูลการจอง
interface ReservationData {
  id: number;
  reservationDate: string;
  userId: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
  book: {
    title: string;
    isbn: string;
  };
  reservationStatus: {
    status: string;
  };
  notifiedAt?: string;
  expiresAt?: string;
  allocatedBookLicense?: {
    licenseNumber: string;
  };
}

export default function ReservationAdminPage() {
  const [reservationData, setReservationData] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 🎨 สีสำหรับสถานะต่างๆ
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting': return 'orange';
      case 'notified': return 'blue';
      case 'fulfilled': return 'green';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting': return 'รอการจัดสรร';
      case 'notified': return 'แจ้งเตือนแล้ว';
      case 'fulfilled': return 'เสร็จสิ้น';
      case 'expired': return 'หมดอายุ';
      case 'cancelled': return 'ยกเลิก';
      default: return 'ไม่ทราบ';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting': return <ClockCircleOutlined />;
      case 'notified': return <ExclamationCircleOutlined />;
      case 'fulfilled': return <CheckCircleOutlined />;
      case 'expired': return <ExclamationCircleOutlined />;
      case 'cancelled': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  // 📅 ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 📋 Column สำหรับตาราง
  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'ผู้จอง',
      key: 'user',
      render: (record: ReservationData) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.user.firstname} {record.user.lastname}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {record.userId}
          </div>
        </div>
      ),
    },
    {
      title: 'หนังสือ',
      key: 'book',
      render: (record: ReservationData) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.book.title}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            ISBN: {record.book.isbn}
          </div>
        </div>
      ),
    },
    {
      title: 'วันที่จอง',
      dataIndex: 'reservationDate',
      key: 'reservationDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'วันที่แจ้งเตือน',
      dataIndex: 'notifiedAt',
      key: 'notifiedAt',
      render: (date?: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'หมดอายุ',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date?: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (record: ReservationData) => (
        <Tag 
          color={getStatusColor(record.reservationStatus.status)} 
          icon={getStatusIcon(record.reservationStatus.status)}
        >
          {getStatusText(record.reservationStatus.status)}
        </Tag>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (record: ReservationData) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            ดูรายละเอียด
          </Button>
        </Space>
      ),
    },
  ];

  // 🔍 แสดงรายละเอียด
  const showDetail = (record: ReservationData) => {
    setSelectedReservation(record);
    setDetailModalVisible(true);
  };

  //  โหลดข้อมูลการจอง
  const loadReservationData = async () => {
    setLoading(true);
    try {
      // TODO: เรียก API จริง
      // const response = await fetch('/api/admin/reservations', {
      //   headers: { Authorization: `Bearer ${authen.getToken()}` }
      // });
      
      // Mock Data สำหรับทดสอบ
      const mockData: ReservationData[] = [
        {
          id: 1,
          reservationDate: '2025-08-20T10:30:00Z',
          userId: 'S001',
          user: {
            firstname: 'สมชาย',
            lastname: 'ใจดี',
            email: 'somchai@email.com'
          },
          book: {
            title: 'Harry Potter and the Chamber of Secrets',
            isbn: '978-0747538493'
          },
          reservationStatus: {
            status: 'Waiting'
          }
        },
        {
          id: 2,
          reservationDate: '2025-08-22T14:15:00Z',
          userId: 'S002',
          user: {
            firstname: 'สมใส',
            lastname: 'รักการอ่าน',
            email: 'somsai@email.com'
          },
          book: {
            title: 'The Hobbit',
            isbn: '978-0547928227'
          },
          reservationStatus: {
            status: 'Notified'
          },
          notifiedAt: '2025-09-01T09:00:00Z',
          expiresAt: '2025-09-03T23:59:59Z',
          allocatedBookLicense: {
            licenseNumber: 'LIC001'
          }
        },
        {
          id: 3,
          reservationDate: '2025-08-18T16:45:00Z',
          userId: 'S003',
          user: {
            firstname: 'สมศักดิ์',
            lastname: 'หนังสือดี',
            email: 'somsak@email.com'
          },
          book: {
            title: 'Murder on the Orient Express',
            isbn: '978-0062693662'
          },
          reservationStatus: {
            status: 'Fulfilled'
          },
          notifiedAt: '2025-08-25T10:30:00Z',
          allocatedBookLicense: {
            licenseNumber: 'LIC002'
          }
        },
        {
          id: 4,
          reservationDate: '2025-08-15T11:20:00Z',
          userId: 'S004',
          user: {
            firstname: 'สมคิด',
            lastname: 'ชอบอ่าน',
            email: 'somkit@email.com'
          },
          book: {
            title: 'The Shining',
            isbn: '978-0307743657'
          },
          reservationStatus: {
            status: 'Expired'
          },
          notifiedAt: '2025-08-20T08:00:00Z',
          expiresAt: '2025-08-22T23:59:59Z'
        }
      ];
      
      setReservationData(mockData);
      
    } catch (error) {
      console.error('Error loading reservation data:', error);
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    loadReservationData();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
           จัดการการจองหนังสือ
        </Title>
        <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
          ดูและจัดการข้อมูลการจองหนังสือของสมาชิกทั้งหมด
        </p>
      </div>

      {/* ตารางข้อมูลการจอง */}
      <Card>
        <Table
          columns={columns}
          dataSource={reservationData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal รายละเอียด */}
      <Modal
        title="📋 รายละเอียดการจอง"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            ปิด
          </Button>
        ]}
        width={600}
      >
        {selectedReservation && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="รหัสการจอง">
              #{selectedReservation.id}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้จอง">
              {selectedReservation.user.firstname} {selectedReservation.user.lastname} ({selectedReservation.userId})
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {selectedReservation.user.email}
            </Descriptions.Item>
            <Descriptions.Item label="หนังสือ">
              {selectedReservation.book.title}
            </Descriptions.Item>
            <Descriptions.Item label="ISBN">
              {selectedReservation.book.isbn}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่จอง">
              {formatDate(selectedReservation.reservationDate)}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่แจ้งเตือน">
              {selectedReservation.notifiedAt ? formatDate(selectedReservation.notifiedAt) : 'ยังไม่แจ้งเตือน'}
            </Descriptions.Item>
            <Descriptions.Item label="วันหมดอายุ">
              {selectedReservation.expiresAt ? formatDate(selectedReservation.expiresAt) : 'ไม่มีกำหนด'}
            </Descriptions.Item>
            <Descriptions.Item label="License ที่จัดสรร">
              {selectedReservation.allocatedBookLicense ? selectedReservation.allocatedBookLicense.licenseNumber : 'ยังไม่จัดสรร'}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag 
                color={getStatusColor(selectedReservation.reservationStatus.status)}
                icon={getStatusIcon(selectedReservation.reservationStatus.status)}
              >
                {getStatusText(selectedReservation.reservationStatus.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 