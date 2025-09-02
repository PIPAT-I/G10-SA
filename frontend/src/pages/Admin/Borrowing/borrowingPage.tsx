import { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Space, Button, message, Modal, Descriptions } from "antd";
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

// 📋 Interface สำหรับข้อมูลการยืม
interface BorrowData {
  id: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  userId: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
  bookLicense: {
    book: {
      title: string;
      isbn: string;
    };
  };
  status: 'active' | 'returned' | 'overdue';
}

export default function BorrowingAdminPage() {
  const [borrowData, setBorrowData] = useState<BorrowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 🎨 สีสำหรับสถานะต่างๆ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'returned': return 'green';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'กำลังยืม';
      case 'returned': return 'คืนแล้ว';
      case 'overdue': return 'เกินกำหนด';
      default: return 'ไม่ทราบ';
    }
  };

  // 📊 คำนวณสถานะจากข้อมูล
  const calculateStatus = (dueDate: string, returnDate?: string): 'active' | 'returned' | 'overdue' => {
    if (returnDate) return 'returned';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    return now > due ? 'overdue' : 'active';
  };

  // 📅 ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      title: 'ผู้ยืม',
      key: 'user',
      render: (record: BorrowData) => (
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
      render: (record: BorrowData) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.bookLicense.book.title}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            ISBN: {record.bookLicense.book.isbn}
          </div>
        </div>
      ),
    },
    {
      title: 'วันที่ยืม',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'กำหนดคืน',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'วันที่คืน',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date?: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (record: BorrowData) => {
        const status = calculateStatus(record.dueDate, record.returnDate);
        return (
          <Tag color={getStatusColor(status)} icon={
            status === 'returned' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
          }>
            {getStatusText(status)}
          </Tag>
        );
      },
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (record: BorrowData) => (
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
  const showDetail = (record: BorrowData) => {
    setSelectedBorrow(record);
    setDetailModalVisible(true);
  };

  // 📊 โหลดข้อมูลการยืม
  const loadBorrowData = async () => {
    setLoading(true);
    try {
      // TODO: เรียก API จริง
      // const response = await fetch('/api/admin/borrows', {
      //   headers: { Authorization: `Bearer ${authen.getToken()}` }
      // });
      
      // Mock Data สำหรับทดสอบ
      const mockData: BorrowData[] = [
        {
          id: 1,
          borrowDate: '2025-08-20T00:00:00Z',
          dueDate: '2025-09-05T00:00:00Z',
          returnDate: undefined,
          userId: 'S001',
          user: {
            firstname: 'สมชาย',
            lastname: 'ใจดี',
            email: 'somchai@email.com'
          },
          bookLicense: {
            book: {
              title: 'Harry Potter and the Philosopher\'s Stone',
              isbn: '978-0747532699'
            }
          },
          status: 'overdue'
        },
        {
          id: 2,
          borrowDate: '2025-08-25T00:00:00Z',
          dueDate: '2025-09-10T00:00:00Z',
          returnDate: '2025-09-01T00:00:00Z',
          userId: 'S002',
          user: {
            firstname: 'สมใส',
            lastname: 'รักการอ่าน',
            email: 'somsai@email.com'
          },
          bookLicense: {
            book: {
              title: 'The Lord of the Rings',
              isbn: '978-0544003415'
            }
          },
          status: 'returned'
        },
        {
          id: 3,
          borrowDate: '2025-09-01T00:00:00Z',
          dueDate: '2025-09-15T00:00:00Z',
          returnDate: undefined,
          userId: 'S003',
          user: {
            firstname: 'สมศักดิ์',
            lastname: 'หนังสือดี',
            email: 'somsak@email.com'
          },
          bookLicense: {
            book: {
              title: 'A Game of Thrones',
              isbn: '978-0553593716'
            }
          },
          status: 'active'
        }
      ];
      
      setBorrowData(mockData);
      
    } catch (error) {
      console.error('Error loading borrow data:', error);
      message.error('ไม่สามารถโหลดข้อมูลการยืมได้');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    loadBorrowData();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ color: "#FF8A00", margin: 0 }}>
          📚 จัดการการยืมหนังสือ
        </Title>
        <p style={{ color: "#6B7280", margin: "8px 0 0 0" }}>
          ดูและจัดการข้อมูลการยืมหนังสือของสมาชิกทั้งหมด
        </p>
      </div>

      {/* ตารางข้อมูลการยืม */}
      <Card>
        <Table
          columns={columns}
          dataSource={borrowData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal รายละเอียด */}
      <Modal
        title="รายละเอียดการยืม"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            ปิด
          </Button>
        ]}
        width={600}
      >
        {selectedBorrow && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="รหัสการยืม">
              #{selectedBorrow.id}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้ยืม">
              {selectedBorrow.user.firstname} {selectedBorrow.user.lastname} ({selectedBorrow.userId})
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {selectedBorrow.user.email}
            </Descriptions.Item>
            <Descriptions.Item label="หนังสือ">
              {selectedBorrow.bookLicense.book.title}
            </Descriptions.Item>
            <Descriptions.Item label="ISBN">
              {selectedBorrow.bookLicense.book.isbn}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่ยืม">
              {formatDate(selectedBorrow.borrowDate)}
            </Descriptions.Item>
            <Descriptions.Item label="กำหนดคืน">
              {formatDate(selectedBorrow.dueDate)}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่คืน">
              {selectedBorrow.returnDate ? formatDate(selectedBorrow.returnDate) : 'ยังไม่คืน'}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag color={getStatusColor(calculateStatus(selectedBorrow.dueDate, selectedBorrow.returnDate))}>
                {getStatusText(calculateStatus(selectedBorrow.dueDate, selectedBorrow.returnDate))}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}