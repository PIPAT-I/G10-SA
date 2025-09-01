// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   Row,
//   Col,
//   List,
//   Avatar,
//   Typography,
//   Spin,
//   Button,
//   Modal,
//   Input,
//   message,
//   Popconfirm,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   BookOutlined,
// } from "@ant-design/icons";
// import type { Booklist, Book } from "../../interfaces";
// import { booklistAPI, bookAPI } from "../../services/https";

// const { Title, Text } = Typography;

// const BooklistsPage: React.FC = () => {
//   const [booklists, setBooklists] = useState<Booklist[]>([]);
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [createModalVisible, setCreateModalVisible] = useState(false);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [selectedBooklist, setSelectedBooklist] = useState<Booklist | null>(
//     null
//   );
//   const [newBooklistTitle, setNewBooklistTitle] = useState("");
//   const [editBooklistTitle, setEditBooklistTitle] = useState("");
//   const [newBooklistSelectedBookIds, setNewBooklistSelectedBookIds] =
//     useState<number[]>([]);
//   const [messageApi, contextHolder] = message.useMessage();
//   const navigate = useNavigate();

//   const userId = localStorage.getItem("id");

//   useEffect(() => {
//     fetchBooklists();
//     fetchBooks();
//   }, []);

//   const fetchBooklists = async () => {
//     try {
//       setLoading(true);
//       const response = await booklistAPI.getAll();
//       const userBooklists = (response.data || response).filter(
//         (bl: Booklist) => bl.member_id === Number(userId)
//       );
//       setBooklists(userBooklists);
//     } catch (error) {
//       console.error("Error fetching booklists:", error);
//       messageApi.error("ไม่สามารถโหลดรายการหนังสือได้");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBooks = async () => {
//     try {
//       const response = await bookAPI.getAll();
//       setBooks(response.data || response);
//     } catch (error) {
//       console.error("Error fetching books:", error);
//     }
//   };

//   const handleCreateBooklist = async () => {
//     if (
//       !newBooklistTitle.trim() ||
//       !userId ||
//       newBooklistSelectedBookIds.length === 0
//     ) {
//       messageApi.error("กรุณาใส่ชื่อรายการและเลือกหนังสืออย่างน้อย 1 เล่ม");
//       return;
//     }

//     try {
//       const response = await booklistAPI.create({
//         title: newBooklistTitle,
//         member_id: Number(userId),
//         books: newBooklistSelectedBookIds.map((bookId) => ({ ID: bookId })),
//       });

//       if (response.status === 201) {
//         messageApi.success("สร้างรายการหนังสือสำเร็จ");
//         setCreateModalVisible(false);
//         setNewBooklistTitle("");
//         setNewBooklistSelectedBookIds([]);
//         setTimeout(fetchBooklists, 1000);
//       }
//     } catch (error) {
//       console.error("Error creating booklist:", error);
//       messageApi.error("ไม่สามารถสร้างรายการหนังสือได้");
//     }
//   };

//   const handleEditBooklist = async () => {
//     if (!selectedBooklist || !editBooklistTitle.trim()) return;

//     try {
//       await booklistAPI.update({
//         ID: selectedBooklist.ID,
//         title: editBooklistTitle,
//       });

//       messageApi.success("แก้ไขรายการหนังสือสำเร็จ");
//       setEditModalVisible(false);
//       setEditBooklistTitle("");
//       setSelectedBooklist(null);
//       fetchBooklists();
//     } catch (error) {
//       console.error("Error updating booklist:", error);
//       messageApi.error("ไม่สามารถแก้ไขรายการหนังสือได้");
//     }
//   };

//   const handleDeleteBooklist = async (booklistId: number) => {
//     try {
//       await booklistAPI.delete(booklistId);
//       messageApi.success("ลบรายการหนังสือสำเร็จ");
//       setTimeout(fetchBooklists, 1000);
//     } catch (error) {
//       console.error("Error deleting booklist:", error);
//       messageApi.error("ไม่สามารถลบรายการหนังสือได้");
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: 50 }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div>
//       {contextHolder}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 16,
//         }}
//       >
//         <Title level={2}>รายการหนังสือของฉัน</Title>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => setCreateModalVisible(true)}
//         >
//           สร้างรายการหนังสือใหม่
//         </Button>
//       </div>

//       <Row gutter={[16, 16]}>
//         {booklists.map((booklist) => (
//           <Col xs={24} sm={12} md={8} lg={6} key={booklist.ID}>
//             <Card
//               hoverable
//               cover={
//                 <div
//                   style={{
//                     height: 200,
//                     background:
//                       "linear-gradient(45deg, #1e90ff 0%, #00ced1 100%)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                   }}
//                   onClick={() => navigate(`/booklists/${booklist.ID}`)}
//                 >
//                   <BookOutlined style={{ fontSize: 48, color: "white" }} />
//                 </div>
//               }
//               actions={[
//                 <Button
//                   type="text"
//                   icon={<EditOutlined />}
//                   onClick={() => {
//                     setSelectedBooklist(booklist);
//                     setEditBooklistTitle(booklist.title);
//                     setEditModalVisible(true);
//                   }}
//                 >
//                   แก้ไข
//                 </Button>,
//                 <Popconfirm
//                   title="คุณแน่ใจหรือไม่ที่จะลบรายการหนังสือนี้?"
//                   onConfirm={() => handleDeleteBooklist(booklist.ID)}
//                   okText="ใช่"
//                   cancelText="ไม่"
//                 >
//                   <Button type="text" danger icon={<DeleteOutlined />}>
//                     ลบ
//                   </Button>
//                 </Popconfirm>,
//               ]}
//             >
//               <Card.Meta
//                 title={booklist.title}
//                 description={
//                   <div>
//                     <Text type="secondary">
//                       {booklist.books?.length || 0} เล่ม
//                     </Text>
//                   </div>
//                 }
//               />
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       {/* Create Booklist Modal */}
//       <Modal
//         title="สร้างรายการหนังสือใหม่"
//         open={createModalVisible}
//         onOk={handleCreateBooklist}
//         onCancel={() => {
//           setCreateModalVisible(false);
//           setNewBooklistTitle("");
//           setNewBooklistSelectedBookIds([]);
//         }}
//         okText="สร้าง"
//         cancelText="ยกเลิก"
//       >
//         <div style={{ marginBottom: 16 }}>
//           <Text strong>ชื่อรายการหนังสือ:</Text>
//           <Input
//             value={newBooklistTitle}
//             onChange={(e) => setNewBooklistTitle(e.target.value)}
//             placeholder="ใส่ชื่อรายการหนังสือ"
//             style={{ marginTop: 8 }}
//           />
//         </div>

//         <div style={{ marginBottom: 16 }}>
//           <Text strong>เลือกหนังสือ (อย่างน้อย 1 เล่ม):</Text>
//           <div style={{ marginTop: 8, maxHeight: 300, overflowY: "auto" }}>
//             <List
//               size="small"
//               dataSource={books}
//               rowKey={(book) => book.ID}
//               renderItem={(book) => {
//                 const isSelected = newBooklistSelectedBookIds.includes(book.ID);
//                 return (
//                   <List.Item
//                     style={{
//                       cursor: "pointer",
//                       backgroundColor: isSelected ? "#f0f8ff" : "white",
//                       border: isSelected
//                         ? "1px solid #1890ff"
//                         : "1px solid #f0f0f0",
//                       borderRadius: 4,
//                       marginBottom: 4,
//                     }}
//                     onClick={() => {
//                       if (isSelected) {
//                         setNewBooklistSelectedBookIds(
//                           newBooklistSelectedBookIds.filter((id) => id !== book.ID)
//                         );
//                       } else {
//                         setNewBooklistSelectedBookIds([
//                           ...newBooklistSelectedBookIds,
//                           book.ID,
//                         ]);
//                       }
//                     }}
//                   >
//                     <List.Item.Meta
//                       avatar={<Avatar icon={<BookOutlined />} />}
//                       title={book.title}
//                       description={book.author}
//                     />
//                     {isSelected && (
//                       <div
//                         style={{
//                           color: "#1890ff",
//                           fontSize: 16,
//                           fontWeight: "bold",
//                         }}
//                       >
//                         ✓
//                       </div>
//                     )}
//                   </List.Item>
//                 );
//               }}
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Edit Booklist Modal */}
//       <Modal
//         title="แก้ไขรายการหนังสือ"
//         open={editModalVisible}
//         onOk={handleEditBooklist}
//         onCancel={() => {
//           setEditModalVisible(false);
//           setEditBooklistTitle("");
//           setSelectedBooklist(null);
//         }}
//         okText="บันทึก"
//         cancelText="ยกเลิก"
//       >
//         <div style={{ marginBottom: 16 }}>
//           <Text strong>ชื่อรายการหนังสือ:</Text>
//           <Input
//             value={editBooklistTitle}
//             onChange={(e) => setEditBooklistTitle(e.target.value)}
//             placeholder="ใส่ชื่อรายการหนังสือ"
//             style={{ marginTop: 8 }}
//           />
//         </div>

//         {selectedBooklist && (
//           <div>
//             <Text strong>หนังสือในรายการ:</Text>
//             <List
//               size="small"
//               dataSource={selectedBooklist.books || []}
//               rowKey={(book) => book.ID}
//               renderItem={(book) => (
//                 <List.Item>
//                   <List.Item.Meta
//                     avatar={<Avatar icon={<BookOutlined />} />}
//                     title={book.title}
//                     description={book.author}
//                   />
//                 </List.Item>
//               )}
//             />
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default BooklistsPage;
