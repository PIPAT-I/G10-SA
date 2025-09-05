import { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Space, Button, message, Modal, Descriptions, Popconfirm } from "antd";
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, UndoOutlined } from "@ant-design/icons";
import { getAllBorrows, returnBorrow, calculateBorrowStatus, getStatusColor, getStatusText, autoReturnOverdueBooks } from "../../../services/https/borrow";
import type { Borrow } from "../../../interfaces/Borrow";

const { Title } = Typography;

export default function BorrowingAdminPage() {
  const [borrowData, setBorrowData] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 📅 ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 📄 คืนหนังสือ
  const handleReturnBook = async (borrow: Borrow) => {
    try {
      await returnBorrow(borrow.ID, borrow.user_id);
      message.success('คืนหนังสือเรียบร้อยแล้ว');
      loadBorrowData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error returning book:', error);
      message.error('ไม่สามารถคืนหนังสือได้');
    }
  };

  // Auto-return หนังสือเกินกำหนด
  const handleAutoReturn = async () => {
    try {
      const result = await autoReturnOverdueBooks();
      message.success(`ดำเนินการเสร็จสิ้น: คืนหนังสืออัตโนมัติ ${result.processed_count} เล่ม จากทั้งหมด ${result.total_overdue} เล่ม`);
      if (result.errors && result.errors.length > 0) {
        console.warn('Auto-return errors:', result.errors);
      }
      loadBorrowData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error auto-returning books:', error);
      message.error('ไม่สามารถดำเนินการคืนหนังสืออัตโนมัติได้');
    }
  };

  // 📋 Column สำหรับตาราง
  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'ID',
      key: 'ID',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'ผู้ยืม',
      key: 'user',
      render: (record: Borrow) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.user?.FirstName} {record.user?.LastName}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {record.user_id}
          </div>
        </div>
      ),
    },
    {
      title: 'หนังสือ',
      key: 'book',
      render: (record: Borrow) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.book_license?.book?.title || 'ไม่มีข้อมูล'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            ISBN: {record.book_license?.book?.isbn || 'ไม่มีข้อมูล'}
          </div>
        </div>
      ),
    },
    {
      title: 'วันที่ยืม',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'กำหนดคืน',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'วันที่คืน',
      dataIndex: 'return_date',
      key: 'return_date',
      render: (date?: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (record: Borrow) => {
        const status = calculateBorrowStatus(record.due_date, record.return_date);
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
      render: (record: Borrow) => {
        const status = calculateBorrowStatus(record.due_date, record.return_date);
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            >
              ดูรายละเอียด
            </Button>
            {status !== 'returned' && (
              <Button
                type="link"
                onClick={() => handleReturnBook(record)}
                style={{ color: '#52c41a' }}
              >
                คืนหนังสือ
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 🔍 แสดงรายละเอียด
  const showDetail = (record: Borrow) => {
    setSelectedBorrow(record);
    setDetailModalVisible(true);
  };

  // 📊 โหลดข้อมูลการยืม
  const loadBorrowData = async () => {
    setLoading(true);
    try {
      const data = await getAllBorrows();
      setBorrowData(data);
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

      {/* ปุ่ม Auto-return */}
      <div style={{ marginBottom: "16px", textAlign: "right" }}>
        <Button
          type="primary"
          onClick={handleAutoReturn}
          style={{ backgroundColor: "#ff8a00", borderColor: "#ff8a00" }}
        >
          คืนหนังสือเกินกำหนดอัตโนมัติ
        </Button>
      </div>

      {/* ตารางข้อมูลการยืม */}
      <Card>
        <Table
          columns={columns}
          dataSource={borrowData}
          loading={loading}
          rowKey="ID"
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
              #{selectedBorrow.ID}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้ยืม">
              {selectedBorrow.user?.FirstName} {selectedBorrow.user?.LastName} ({selectedBorrow.user_id})
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {selectedBorrow.user?.Email || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="หนังสือ">
              {selectedBorrow.book_license?.book?.title || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="ISBN">
              {selectedBorrow.book_license?.book?.isbn || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่ยืม">
              {formatDate(selectedBorrow.borrow_date)}
            </Descriptions.Item>
            <Descriptions.Item label="กำหนดคืน">
              {formatDate(selectedBorrow.due_date)}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่คืน">
              {selectedBorrow.return_date ? formatDate(selectedBorrow.return_date) : 'ยังไม่คืน'}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag color={getStatusColor(calculateBorrowStatus(selectedBorrow.due_date, selectedBorrow.return_date))}>
                {getStatusText(calculateBorrowStatus(selectedBorrow.due_date, selectedBorrow.return_date))}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}