import React from "react";

const TestPage: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ff6b6b", // สีแดงเพื่อให้เห็นขอบเขต
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Kanit, sans-serif",
        fontSize: "24px",
        color: "white",
        margin: 0,
        padding: 0,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Test Page</h1>
        <p>นี่คือหน้าทดสอบเพื่อดูว่าพื้นที่เต็มหน้าหรือไม่</p>
        <p>ถ้าเห็นสีแดงเต็มพื้นที่ แสดงว่า FullLayout ทำงานถูกต้อง</p>
      </div>
    </div>
  );
};

export default TestPage;
