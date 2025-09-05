import { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Space, Button, message, Modal, Descriptions, Popconfirm } from "antd";
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, UndoOutlined } from "@ant-design/icons";
import { 
  getAllReservations, 
  fulfillReservation, 
  cancelReservation, 
  getReservationStatusColor, 
  getReservationStatusText,
  getTimeUntilExpiry,
  isNearExpiry
} from "../../../services/https/reservation";
import type { Reservation } from "../../../interfaces/Reservation";

const { Title } = Typography;

export default function ReservationAdminPage() {
  const [reservationData, setReservationData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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

  // 🎨 ไอคอนสำหรับสถานะ
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

  // ✅ ดำเนินการจอง (Fulfill)
  const handleFulfillReservation = async (reservation: Reservation) => {
    try {
      await fulfillReservation(reservation.ID, reservation.user_id);
      message.success('ดำเนินการจองเรียบร้อยแล้ว');
      loadReservationData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error fulfilling reservation:', error);
      message.error('ไม่สามารถดำเนินการจองได้');
    }
  };

  // ❌ ยกเลิกการจอง
  const handleCancelReservation = async (reservation: Reservation, reason: string = 'ยกเลิกโดยแอดมิน') => {
    try {
      await cancelReservation(reservation.ID, reservation.user_id, reason);
      message.success('ยกเลิกการจองเรียบร้อยแล้ว');
      loadReservationData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      message.error('ไม่สามารถยกเลิกการจองได้');
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
      title: 'ผู้จอง',
      key: 'user',
      render: (record: Reservation) => (
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
      render: (record: Reservation) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.book?.title || 'ไม่มีข้อมูล'}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            ISBN: {record.book?.isbn || 'ไม่มีข้อมูล'}
          </div>
        </div>
      ),
    },
    {
      title: 'วันที่จอง',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'วันที่แจ้งเตือน',
      dataIndex: 'notified_at',
      key: 'notified_at',
      render: (date?: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'หมดอายุ',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (date?: string) => {
        if (!date) return '-';
        const isNear = isNearExpiry(date);
        return (
          <div style={{ color: isNear ? '#ff4d4f' : 'inherit' }}>
            {formatDate(date)}
            {isNear && (
              <div style={{ fontSize: '10px', color: '#ff4d4f' }}>
                {getTimeUntilExpiry(date)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (record: Reservation) => (
        <Tag 
          color={getReservationStatusColor(record.reservation_status?.status_name || '')} 
          icon={getStatusIcon(record.reservation_status?.status_name || '')}
        >
          {getReservationStatusText(record.reservation_status?.status_name || '')}
        </Tag>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (record: Reservation) => {
        const status = record.reservation_status?.status_name?.toLowerCase();
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            >
              ดูรายละเอียด
            </Button>
            {status === 'notified' && (
              <Button
                type="link"
                onClick={() => handleFulfillReservation(record)}
                style={{ color: '#52c41a' }}
              >
                ดำเนินการ
              </Button>
            )}
            {(status === 'waiting' || status === 'notified') && (
              <Button
                type="link"
                onClick={() => handleCancelReservation(record)}
                danger
              >
                ยกเลิก
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 🔍 แสดงรายละเอียด
  const showDetail = (record: Reservation) => {
    setSelectedReservation(record);
    setDetailModalVisible(true);
  };

  //  โหลดข้อมูลการจอง
  const loadReservationData = async () => {
    setLoading(true);
    try {
      const data = await getAllReservations();
      setReservationData(data);
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
          rowKey="ID"
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
              #{selectedReservation.ID}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้จอง">
              {selectedReservation.user?.FirstName} {selectedReservation.user?.LastName} ({selectedReservation.user_id})
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {selectedReservation.user?.Email || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="หนังสือ">
              {selectedReservation.book?.title || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="ISBN">
              {selectedReservation.book?.isbn || 'ไม่มีข้อมูล'}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่จอง">
              {formatDate(selectedReservation.reservation_date)}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่แจ้งเตือน">
              {selectedReservation.notified_at ? formatDate(selectedReservation.notified_at) : 'ยังไม่แจ้งเตือน'}
            </Descriptions.Item>
            <Descriptions.Item label="วันหมดอายุ">
              {selectedReservation.expires_at ? formatDate(selectedReservation.expires_at) : 'ไม่มีกำหนด'}
            </Descriptions.Item>
            <Descriptions.Item label="License ที่จัดสรร">
              {selectedReservation.allocated_book_license?.book_license_id || 'ยังไม่จัดสรร'}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag 
                color={getReservationStatusColor(selectedReservation.reservation_status?.status_name || '')}
                icon={getStatusIcon(selectedReservation.reservation_status?.status_name || '')}
              >
                {getReservationStatusText(selectedReservation.reservation_status?.status_name || '')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 