import { useState, useEffect } from "react";
import { Card, Typography, Tag, Button, message, Row, Col, Empty, Space } from "antd";
import { UndoOutlined, BookOutlined } from "@ant-design/icons";
import { getUserBorrows, returnBorrow } from "../../../services/https/borrow";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Borrow } from "../../../interfaces/Borrow";

const { Title, Text } = Typography;

export default function BorrowingUserPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [borrowData, setBorrowData] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(false);

  // สำหรับความเข้ากันได้กับ API response format
  const userId = user?.UserID || (user as any)?.user_id;

  //ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  //  คืนหนังสือ
  const handleReturnBook = async (borrow: Borrow) => {
    console.log('handleReturnBook called:', { borrow, userId });
    
    if (!userId) {
      console.log('No userId found');
      message.error('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      console.log('Calling returnBorrow API...');
      await returnBorrow(borrow.ID, userId);
      console.log('Return successful');
      message.success('คืนหนังสือเรียบร้อยแล้ว');
      loadBorrowData(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error returning book:', error);
      message.error('ไม่สามารถคืนหนังสือได้');
    }
  };

  //  โหลดข้อมูลการยืม
  const loadBorrowData = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getUserBorrows(userId);
      setBorrowData(data);
    } catch (error) {
      console.error('Error loading borrow data:', error);
      message.error('ไม่สามารถโหลดข้อมูลการยืมได้');
    } finally {
      setLoading(false);
    }
  };

  //  โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    if (userId) {
      loadBorrowData();
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
            My Borrowing
          </Title>
          <Text style={{ color: "#6B7280", fontSize: '16px' }}>
            Manage your borrowed books and due dates
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

      {/* Borrowing Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Text>กำลังโหลดข้อมูล...</Text>
        </div>
      ) : borrowData.length === 0 ? (
        <Empty
          description="คุณยังไม่ได้ยืมหนังสือเล่มใด"
          style={{ 
            padding: '60px 0',
            backgroundColor: 'white',
            borderRadius: '12px',
            margin: '24px 0'
          }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {borrowData.map((borrow) => {
            // คำนวณสถานะการยืม
            const today = new Date();
            const dueDate = new Date(borrow.due_date);
            const isOverdue = today > dueDate && !borrow.return_date;
            const isReturned = !!borrow.return_date;
            
            let statusColor = 'green';
            let statusText = 'Active';
            
            if (isReturned) {
              statusColor = 'blue';
              statusText = 'Returned';
            } else if (isOverdue) {
              statusColor = 'red';
              statusText = 'Overdue';
            }
            
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={borrow.ID}>
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
                      {borrow.book_license?.book?.title || 'ไม่มีข้อมูลหนังสือ'}
                    </Title>
                    
                    <Text style={{ 
                      color: '#6B7280', 
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '16px'
                    }}>
                      by {borrow.book_license?.book?.authors?.map((author: any) => author.author_name).join(', ') || 'Unknown Author'}
                    </Text>

                    {/* Date Information */}
                    <div style={{ marginBottom: '20px' }}>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                            DATE BORROWED
                          </Text>
                          <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                            DUE DATE
                          </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                            {formatDate(borrow.borrow_date)}
                          </Text>
                          <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                            {formatDate(borrow.due_date)}
                          </Text>
                        </div>
                        
                        {borrow.return_date && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                                DAYS LEFT
                              </Text>
                              <Text strong style={{ color: '#8C8C8C', fontSize: '12px' }}>
                                STATUS
                              </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ color: '#011F4B', fontSize: '14px', fontWeight: 500 }}>
                                Returned
                              </Text>
                              <Text style={{ color: '#52C41A', fontSize: '14px', fontWeight: 500 }}>
                                Returned
                              </Text>
                            </div>
                          </>
                        )}
                      </Space>
                    </div>

                    {/* Action Button */}
                    {!borrow.return_date && (
                      <Button
                        type="primary"
                        block
                        onClick={() => handleReturnBook(borrow)}
                        style={{
                          backgroundColor: '#FF8A00',
                          borderColor: '#FF8A00',
                          borderRadius: '8px',
                          height: '40px',
                          fontWeight: 500
                        }}
                        icon={<UndoOutlined />}
                      >
                        Return Book
                      </Button>
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
