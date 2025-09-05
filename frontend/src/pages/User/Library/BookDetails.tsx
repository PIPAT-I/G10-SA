import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card,
  Typography, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Skeleton, 
  message,
  Space,
} from 'antd';
import { 
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getBookById } from '../../../services/https/book';
import { createBorrow, getUserBorrows } from '../../../services/https/borrow';
import { createReservation } from '../../../services/https/reservation';
import { useAuth } from '../../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

// Interface สำหรับ Book Detail
interface BookDetailInterface {
  ID: number;
  Title: string;
  CoverImage?: string;
  Authors?: Array<{
    ID: number;
    Name: string;
  }>;
  Publisher?: {
    ID: number;
    Name?: string;
    publisher_name?: string;
  };
  Language?: {
    ID: number;
    Name?: string;
    name?: string;
  };
  Description?: string;
  PublicationYear?: number;
  ISBN?: string;
  Pages?: number;
  FileType?: {
    ID: number;
    Name: string;
  };
  Category?: {
    ID: number;
    Name: string;
  };
}

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  
  // สร้าง userId compatibility layer
  const userId = user?.UserID || (user as any)?.user_id;
  
  const [book, setBook] = useState<BookDetailInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [isAlreadyBorrowed, setIsAlreadyBorrowed] = useState(false);
  const [bookAvailability, setBookAvailability] = useState<'available' | 'fully-borrowed' | 'checking'>('checking');
  
  // State สำหรับปุ่มเดียว
  const [buttonState, setButtonState] = useState<'loading' | 'login' | 'borrow' | 'reserve' | 'borrowed'>('loading');
  
  const [messageApi, contextHolder] = message.useMessage();

  // ฟังก์ชันตรวจสอบว่ายืมหนังสือเล่มนี้อยู่หรือไม่
  const checkBorrowStatus = async () => {
    if (!userId || !book?.ID) return;

    try {
      const userBorrows = await getUserBorrows(userId);
      const activeBorrow = userBorrows.find(borrow => 
        borrow.book_license?.book?.ID === book.ID && !borrow.return_date
      );
      setIsAlreadyBorrowed(!!activeBorrow);
    } catch (error) {
      console.error('Error checking borrow status:', error);
    }
  };

  // ฟังก์ชันตรวจสอบ availability ของหนังสือ
  const checkBookAvailability = async () => {
    if (!book?.ID) return;

    console.log('checkBookAvailability called for book:', book.ID);
    
    try {
      // สำหรับตอนนี้ให้ available ก่อน เพื่อทดสอบว่าปุ่มทำงาน
      // จะมาทำ logic ที่ซับซ้อนขึ้นภายหลัง
      console.log('Setting bookAvailability to available');
      setBookAvailability('available');
    } catch (error) {
      console.error('Error checking book availability:', error);
      setBookAvailability('available'); // default ให้ available
    }
  };

  // ฟังก์ชันโหลดข้อมูลหนังสือ
  const loadBookDetails = async (bookId: string) => {
    try {
      setLoading(true);
      const res = await getBookById(parseInt(bookId));
      
      if (res && (res.ID || res.id)) {
        // Map ข้อมูลให้ตรงกับ Interface
        // แปลง authors array ใหม่ให้ตรงกับ backend
        let authorsArray = [];
        if (res.authors && Array.isArray(res.authors) && res.authors.length > 0) {
          authorsArray = res.authors.map((author: any) => ({
            ID: author.ID,
            Name: author.author_name
          }));
        }

        const bookDetail: BookDetailInterface = {
          ID: res.ID || res.id,
          Title: res.title || res.Title || "Untitled",
          CoverImage: res.cover_image ? `http://localhost:8088${res.cover_image}` : (res.CoverImage || res.image),
          Authors: authorsArray,
          Publisher: res.publisher || res.Publisher,
          Language: res.language || res.Language,
          Description: res.synopsis || res.Description || res.description,
          PublicationYear: res.published_year || res.PublicationYear || res.publication_year,
          ISBN: res.isbn || res.ISBN,
          Pages: res.total_page || res.Pages || res.pages,
          FileType: res.file_type || res.FileType,
          Category: res.category || res.Category
        };
        
        setBook(bookDetail);
      } else {
        messageApi.open({
          type: "error",
          content: "Book not found",
        });
        // Redirect back to library
        setTimeout(() => {
          navigate('/user/library');
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to load book details:", error);
      messageApi.open({
        type: "error",
        content: "Failed to load book details",
      });
      // Redirect back to library
      setTimeout(() => {
        navigate('/user/library');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBookDetails(id);
    } else {
      navigate('/user/library');
    }
  }, [id, navigate]);

  // ตรวจสอบสถานะการยืมเมื่อโหลดหนังสือเสร็จ
  useEffect(() => {
    if (book && userId && !authLoading) {
      checkBorrowStatus();
      checkBookAvailability();
    }
  }, [book, userId, authLoading]);

  // จัดการ buttonState
  useEffect(() => {
    console.log('Debug ButtonState:', {
      authLoading,
      isAuthenticated,
      user: userId,
      fullUser: user,
      isAlreadyBorrowed,
      bookAvailability
    });
    
    if (authLoading) {
      setButtonState('loading');
    } else if (!isAuthenticated) {
      setButtonState('login');
    } else if (!userId) {
      // ถ้า authenticated แต่ยังไม่มี user ให้รอสักครู่
      console.log('Authenticated but no user yet, trying to refresh...');
      refreshUser(); // ลอง refresh user
      setButtonState('loading');
    } else if (isAlreadyBorrowed) {
      setButtonState('borrowed');
    } else if (bookAvailability === 'fully-borrowed') {
      setButtonState('reserve');
    } else if (bookAvailability === 'available') {
      setButtonState('borrow');
    } else {
      // ถ้า bookAvailability ยัง checking อยู่ ให้แสดง loading
      setButtonState('loading');
    }
  }, [authLoading, isAuthenticated, user, isAlreadyBorrowed, bookAvailability, refreshUser]);

  const handleGoBack = () => {
    navigate('/user/library');
  };

  // ฟังก์ชันยืมหนังสือ
  const handleBorrow = async () => {
    // รองรับทั้ง UserID และ user_id
    const userId = user?.UserID || (user as any)?.user_id;
    
    console.log('handleBorrow called:', {
      authLoading,
      isAuthenticated,
      user: userId,
      borrowing
    });
    
    // ถ้ายังโหลด auth อยู่ ให้รอก่อน
    if (authLoading) {
      console.log('Auth still loading, skipping borrow');
      return;
    }
    
    if (!isAuthenticated || !userId) {
      console.log('User not authenticated, showing login message');
      messageApi.open({
        type: "error",
        content: "Please login to borrow books",
      });
      return;
    }

    if (!book?.ID) {
      messageApi.open({
        type: "error",
        content: "Book information not available",
      });
      return;
    }

    try {
      setBorrowing(true);
      
      // เรียก API สำหรับยืมหนังสือ
      await createBorrow({
        user_id: userId,
        book_id: book.ID
      });

      messageApi.open({
        type: "success",
        content: "Book borrowed successfully! Redirecting to My Borrowing page...",
      });

      // รอ 1.5 วินาทีแล้วไปหน้า My Borrowing
      setTimeout(() => {
        navigate('/user/borrowing');
      }, 1500);

    } catch (error: any) {
      console.error('Error borrowing book:', error);
      
      // ถ้าไม่สามารถยืมได้ ให้เปลี่ยนเป็นโหมดจอง
      if (error.response?.status === 400 || error.response?.data?.error?.message?.includes('available')) {
        setBookAvailability('fully-borrowed');
        messageApi.open({
          type: "info",
          content: "This book is fully borrowed. You can reserve it instead.",
        });
      } else {
        // จัดการ error messages อื่นๆ
        let errorMessage = "Failed to borrow book. Please try again.";
        
        if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        messageApi.open({
          type: "error",
          content: errorMessage,
        });
      }
    } finally {
      setBorrowing(false);
    }
  };

  // ฟังก์ชันจองหนังสือ
  const handleReservation = async () => {
    // รองรับทั้ง UserID และ user_id
    const userId = user?.UserID || (user as any)?.user_id;
    
    // ถ้ายังโหลด auth อยู่ ให้รอก่อน
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated || !userId) {
      messageApi.open({
        type: "error",
        content: "Please login to reserve books",
      });
      return;
    }

    if (!book?.ID) {
      messageApi.open({
        type: "error",
        content: "Book information not available",
      });
      return;
    }

    try {
      setReserving(true);
      
      // เรียก API สำหรับจองหนังสือ
      await createReservation({
        user_id: userId,
        book_id: book.ID
      });

      messageApi.open({
        type: "success",
        content: "Book reserved successfully! Redirecting to My Reservations page...",
      });

      // รอ 1.5 วินาทีแล้วไปหน้า My Reservation
      setTimeout(() => {
        navigate('/user/reservation');
      }, 1500);

    } catch (error: any) {
      console.error('Error reserving book:', error);
      
      // จัดการ error messages
      let errorMessage = "Failed to reserve book. Please try again.";
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      messageApi.open({
        type: "error",
        content: errorMessage,
      });
    } finally {
      setReserving(false);
    }
  };

  // ฟังก์ชันจัดการปุ่มหลัก
  const handleMainButton = async () => {
    // ป้องกันการกดซ้ำ
    if (borrowing || reserving || authLoading) {
      return;
    }
    
    switch (buttonState) {
      case 'login':
        navigate('/login');
        break;
      case 'borrow':
        await handleBorrow();
        break;
      case 'reserve':
        await handleReservation();
        break;
      default:
        break;
    }
  };

  // ฟังก์ชันสำหรับข้อความปุ่ม
  const getButtonText = () => {
    if (borrowing) return 'Borrowing...';
    if (reserving) return 'Reserving...';
    
    switch (buttonState) {
      case 'loading':
        return 'Checking...';
      case 'login':
        return ' Login to Borrow';
      case 'borrow':
        return ' Borrow this Book';
      case 'reserve':
        return ' Reserve this Book';
      case 'borrowed':
        return ' Already Borrowed';
      default:
        return 'Loading...';
    }
  };

  // ฟังก์ชันสำหรับสไตล์ปุ่ม
  const getButtonStyle = () => {
    const baseStyle = {
      height: "48px",
      fontSize: "16px",
      fontWeight: "400" as const,
      borderRadius: "20px",
      width: "100%",
      marginBottom: "12px",
    };

    switch (buttonState) {
      case 'reserve':
        return {
          ...baseStyle,
          borderColor: "#FF8A00",
          color: "#FF8A00",
          backgroundColor: "transparent"
        };
      case 'borrowed':
        return {
          ...baseStyle,
          backgroundColor: "#f5f5f5",
          borderColor: "#d9d9d9",
          color: "#8c8c8c"
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#FF8A00",
          borderColor: "#FF8A00",
        };
    }
  };

  const basetextcolor = '#011F4B';

  if (loading) {
    return (
      <div style={{ 
        padding: "24px", 
        background: "#f5f5f5", 
        minHeight: "100vh" 
      }}>
        {contextHolder}
        <Card>
          <Skeleton.Image style={{ width: 300, height: 400 }} />
          <Skeleton active />
          <Skeleton active />
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ 
        padding: "24px", 
        background: "#f5f5f5", 
        minHeight: "100vh",
        textAlign: "center"
      }}>
        {contextHolder}
        <Card>
          <Title level={4}>Book not found</Title>
          <Button type="primary" onClick={handleGoBack}>
            Back to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      background: "#f5f5f5", 
      minHeight: "100vh",
      fontFamily: "Kanit, sans-serif"
    }}>
      {contextHolder}
      
      {/* Back Button */}
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleGoBack}
        style={{ 
          marginBottom: "24px",
          color: "#FF8A00",
          fontSize: "16px"
        }}
      >
        Back to Library
      </Button>

      <Card style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Row gutter={[32, 32]}>
          {/* Book Cover */}
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <img
                src={book.CoverImage || "/placeholder-cover.jpg"}
                alt={book.Title}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)"
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-cover.jpg";
                }}
              />
            </div>
          </Col>

          {/* Book Information */}
          <Col xs={24} md={16}>
            <div>
              {/* Title */}
              <Title level={1} style={{ 
                marginBottom: "8px",
                color: basetextcolor,
                fontSize: "2.5rem"
              }}>
                {book.Title}
              </Title>

              {/* Authors */}
              <div style={{ marginBottom: "24px" }}>
                <Text style={{ 
                  fontSize: "18px", 
                  color: basetextcolor,
                  fontWeight: "500"
                }}>
                  by {book.Authors && book.Authors.length > 0 
                    ? book.Authors.map(author => author.Name).join(", ")
                    : "Unknown Author"
                  }
                </Text>
              </div>

              {/* Main Action Button */}
              <Button 
                type={buttonState === 'reserve' ? 'default' : 'primary'}
                size="large"
                onClick={handleMainButton}
                loading={borrowing || reserving || buttonState === 'loading'}
                disabled={borrowing || reserving || buttonState === 'borrowed' || buttonState === 'loading'}
                style={getButtonStyle()}
              >
                {getButtonText()}
              </Button>

              {/* Helper Text */}
              {buttonState === 'borrow' && (
                <div style={{ fontSize: "12px", color: "#6B7280", textAlign: "center", marginTop: "-8px", marginBottom: "12px" }}>
                 
                </div>
              )}

              <Divider />

              {/* Synopsis */}
              {book.Description && (
                <div style={{ marginBottom: "32px" }}>
                  <Title level={4} style={{ 
                    color: basetextcolor,
                    marginBottom: "24px"
                  }}>
                    Synopsis
                  </Title>
                  <Paragraph style={{ 
                    fontSize: "16px", 
                    lineHeight: "1.8",
                    color: "#444",
                    textAlign: "justify"
                  }}>
                    {book.Description}
                  </Paragraph>
                </div>
              )}

              <Divider />

              {/* About the book */}
              <Title level={4} style={{ 
                color: basetextcolor,
                marginBottom: "24px"
              }}>
                About the book
              </Title>

              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {/* Author */}
                    <div>
                      <Text strong style={{ color: "#888", fontSize: "14px" }}>
                        Author
                      </Text>
                      <br />
                      <Text style={{ fontSize: "16px", color: basetextcolor }}>
                        {book.Authors && book.Authors.length > 0 
                          ? book.Authors.map(author => author.Name).join(", ")
                          : "Unknown Author"
                        }
                      </Text>
                    </div>

                    {/* Publication Date */}
                    <div>
                      <Text strong style={{ color: "#888", fontSize: "14px" }}>
                        Publication Date
                      </Text>
                      <br />
                      <Text style={{ fontSize: "16px", color: basetextcolor }}>
                        {book.PublicationYear || "Unknown"}
                      </Text>
                    </div>

                    {/* Pages */}
                    <div>
                      <Text strong style={{ color: "#888", fontSize: "14px" }}>
                        Pages
                      </Text>
                      <br />
                      <Text style={{ fontSize: "16px", color: basetextcolor }}>
                        {book.Pages || "Unknown"}
                      </Text>
                    </div>
                  </Space>
                </Col>

                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {/* Publisher */}
                    <div>
                      <Text strong style={{ color: "#888", fontSize: "14px" }}>
                        Publisher
                      </Text>
                      <br />
                      <Text style={{ fontSize: "16px", color: basetextcolor }}>
                        {book.Publisher?.publisher_name || book.Publisher?.Name || "Unknown Publisher"}
                      </Text>
                    </div>

                    {/* Language */}
                    <div>
                      <Text strong style={{ color: "#888", fontSize: "14px" }}>
                        Language
                      </Text>
                      <br />
                      <Text style={{ fontSize: "16px", color: basetextcolor }}>
                        {book.Language?.name || book.Language?.Name || "Unknown"}
                      </Text>
                    </div>
                    
                    {/* ISBN */}
                    {book.ISBN && (
                      <div>
                        <Text strong style={{ color: "#888", fontSize: "14px" }}>
                          ISBN
                        </Text>
                        <br />
                        <Text style={{ fontSize: "16px", color: basetextcolor}}>
                          {book.ISBN}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
