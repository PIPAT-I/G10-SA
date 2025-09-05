import { useState, useEffect } from "react";
import { Card, Typography, Tag, Button, message, Row, Col, Empty, Space, Popconfirm } from "antd";
import { DeleteOutlined, BookOutlined } from "@ant-design/icons";
import { 
  getUserReservations, 
  cancelReservation, 
  getReservationStatusColor, 
  getReservationStatusText
} from "../../../services/https/reservation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Reservation } from "../../../interfaces/Reservation";

const { Title, Text } = Typography;

export default function ReservationUserPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // สำหรับความเข้ากันได้กับ API response format
  const userId = user?.UserID || (user as any)?.user_id;

  //  ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ยกเลิกการจอง
  const handleCancelReservation = async (reservation: Reservation) => {
    if (!userId) {
      message.error('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      await cancelReservation(reservation.ID, userId, 'ยกเลิกโดยผู้ใช้');
      message.success('ยกเลิกการจองเรียบร้อยแล้ว');
      loadReservationData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      message.error('ไม่สามารถยกเลิกการจองได้');
    }
  };

  //  โหลดข้อมูลการจอง
  const loadReservationData = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getUserReservations(userId);
      setReservationData(data);
    } catch (error) {
      console.error('Error loading reservation data:', error);
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  //  โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    if (userId) {
      loadReservationData();
    }
  }, [userId]);

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      fontFamily: 'Kanit, sans-serif'
    }}>
      {/* Page Header */}
      <div style={{ 
        marginBottom: "32px", 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <Title level={2} style={{ color: "#FF8A00", margin: 0, fontSize: '2rem' }}>
            My Reservations
          </Title>
          <Text style={{ color: "#6B7280", fontSize: '16px' }}>
            Track your book reservations and queue status
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => navigate('/user/library')}
            style={{
              backgroundColor: '#FF8A00',
              borderColor: '#FF8A00',
              borderRadius: '12px',
              fontWeight: 500,
              height: '48px',
              padding: '0 24px',
              fontSize: '16px'
            }}
          >
             Browse Library
          </Button>
        </Space>
      </div>

      {/* Reservation Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Text>กำลังโหลดข้อมูล...</Text>
        </div>
      ) : reservationData.length === 0 ? (
        <Empty
          description="คุณยังไม่ได้จองหนังสือเล่มใด"
          style={{ 
            padding: '60px 0',
            backgroundColor: 'white',
            borderRadius: '12px',
            margin: '24px 0'
          }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {reservationData.map((reservation) => {
            const statusColor = getReservationStatusColor(reservation.reservation_status?.status_name || 'waiting');
            const statusText = getReservationStatusText(reservation.reservation_status?.status_name || 'waiting');
            
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={reservation.ID}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '0' }}
                >
                  {/* Book Cover and Icon */}
                  <div style={{
                    backgroundColor: '#FF8A00',
                    padding: '32px',
                    borderRadius: '12px 12px 0 0',
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    <BookOutlined 
                      style={{ 
                        fontSize: '48px', 
                        color: 'white',
                        marginBottom: '8px'
                      }} 
                    />
                    <Tag 
                      color={statusColor}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        borderRadius: '6px',
                        fontWeight: 500
                      }}
                    >
                      {statusText}
                    </Tag>
                  </div>

                  {/* Book Details */}
                  <div style={{ padding: '20px' }}>
                    <Title level={4} style={{ 
                      margin: '0 0 8px 0', 
                      color: '#011F4B',
                      fontSize: '18px',
                      lineHeight: '1.4'
                    }}>
                      {reservation.book?.title || 'ไม่มีข้อมูลหนังสือ'}
                    </Title>
                    
                    <Text style={{ 
                      color: '#6B7280', 
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '16px'
                    }}>
                      by {reservation.book?.authors?.map((author: any) => author.author_name).join(', ') || 'Unknown Author'}
                    </Text>

                    {/* Date Information */}
                    <div style={{ marginBottom: '20px' }}>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                            RESERVATION DATE
                          </Text>
                          <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                            QUEUE POSITION
                          </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                            {formatDate(reservation.reservation_date)}
                          </Text>
                          <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                            1 of 5
                          </Text>
                        </div>
                        
                        {reservation.notified_at && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                                NOTIFIED AT
                              </Text>
                              <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                                STATUS
                              </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                                {formatDate(reservation.notified_at)}
                              </Text>
                              <Text style={{ 
                                color: statusColor === 'green' ? '#52C41A' : statusColor === 'orange' ? '#FA8C16' : '#F5222D', 
                                fontSize: '14px', 
                                fontWeight: 500 
                              }}>
                                {statusText}
                              </Text>
                            </div>
                          </>
                        )}
                      </Space>
                    </div>

                    {/* Action Button */}
                    {reservation.reservation_status?.status_name !== 'cancelled' && 
                     reservation.reservation_status?.status_name !== 'fulfilled' && (
                      <Popconfirm
                        title="ยกเลิกการจอง"
                        description="คุณแน่ใจหรือไม่ที่จะยกเลิกการจองหนังสือเล่มนี้?"
                        onConfirm={() => handleCancelReservation(reservation)}
                        okText="ยกเลิก"
                        cancelText="ไม่"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          danger
                          block
                          style={{
                            borderRadius: '8px',
                            height: '40px',
                            fontWeight: 500
                          }}
                          icon={<DeleteOutlined />}
                        >
                          Cancel Reservation
                        </Button>
                      </Popconfirm>
                    )}

                    {reservation.reservation_status?.status_name === 'notified' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#FFF7E6',
                        borderRadius: '8px',
                        border: '1px solid #FFD591'
                      }}>
                        <Text style={{ color: '#D48806', fontSize: '12px' }}>
                           Ready to Borrow! Please visit the library to pick up your book.
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}