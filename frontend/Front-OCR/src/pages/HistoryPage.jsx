import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const [documents, setDocuments] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/documents?type_filter=${filterType}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc.id !== id));
      alert("ลบเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2> History </h2>
        <Link to="/upload" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 15px", background: "#1890ff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                + อัปโหลดเพิ่ม
            </button>
        </Link>
      </div>

      <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ fontWeight: "bold" }}>Filter by Type:</label>
        <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
        >
            <option value="All">ทั้งหมด (All)</option>
            <option value="Invoice">ใบเสร็จ (Invoice)</option>
            <option value="Contract">สัญญา (Contract)</option>
            <option value="ID Card">บัตรประชาชน (ID Card)</option>
            <option value="General Document">เอกสารทั่วไป</option>
        </select>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
            <p>ไม่พบประวัติเอกสาร</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {documents.map((doc) => (
                <div key={doc.id} style={{ border: "1px solid #eee", borderRadius: "8px", overflow: "hidden", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", position: "relative" }}>
                    
                    <button 
                        onClick={() => handleDelete(doc.id)}
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(255, 77, 79, 0.9)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                        title="ลบเอกสาร"
                    >
                        Del
                    </button>

                    <div style={{ height: "200px", overflow: "hidden", background: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {doc.display_image ? (
                            <img src={doc.display_image} alt={doc.filename} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                            <span style={{ color: "#999" }}>No Image</span>
                        )}
                    </div>
                    
                    <div style={{ padding: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ 
                                background: doc.categories?.Type === "Invoice" ? "#e6f7ff" : "#f9f0ff", 
                                color: doc.categories?.Type === "Invoice" ? "#1890ff" : "#722ed1",
                                padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" 
                            }}>
                                {doc.categories?.Type || "Unknown"}
                            </span>
                            <span style={{ fontSize: "12px", color: "#888" }}>
                                {new Date(doc.upload_date).toLocaleDateString()}
                            </span>
                        </div>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {doc.filename}
                        </h4>
                        <p style={{ fontSize: "14px", color: "#666", height: "40px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" }}>
                            {doc.extracted_text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;