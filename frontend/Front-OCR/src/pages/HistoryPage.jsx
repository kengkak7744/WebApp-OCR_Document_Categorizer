import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./HistoryPage.css";
import "../App.css";

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
    <div className="main-container">
      <div className="page-header">
        <h2>History</h2>
        <Link to="/upload">
            <button className="btn btn-primary">+ อัปโหลดเพิ่ม</button>
        </Link>
      </div>

      <div className="filter-bar">
        <label>Filter by Type:</label>
        <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
        >
            <option value="All">ทั้งหมด (All)</option>
            <option value="Invoice">ใบเสร็จ (Invoice)</option>
            <option value="Contract">สัญญา (Contract)</option>
            <option value="ID Card">บัตรประชาชน (ID Card)</option>
            <option value="General Document">เอกสารทั่วไป</option>
        </select>
      </div>

      {loading ? <p>Loading...</p> : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>ไม่พบประวัติ</div>
      ) : (
        <div className="history-grid">
            {documents.map((doc) => (
                <div key={doc.id} className="history-card">
                    <button onClick={() => handleDelete(doc.id)} className="delete-btn" title="delete">Del</button>
                    
                    <div className="card-image-box">
                        {doc.display_image ? (
                            <img src={doc.display_image} alt={doc.filename} />
                        ) : <span>No Image</span>}
                    </div>
                    
                    <div className="card-content">
                        <div className="card-header">
                            <span className={`card-tag ${doc.categories?.Type === "Invoice" ? "tag-invoice" : "tag-general"}`}>
                                {doc.categories?.Type || "Unknown"}
                            </span>
                            
                            <span style={{ fontSize: "12px", color: "#888" }}>
                                {new Date(doc.upload_date).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={doc.filename}>
                            {doc.filename}
                        </h4>
                        
                        <p style={{ fontSize: "14px", color: "#666", height: "40px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", margin: 0 }}>
                            {doc.extracted_text || "(ไม่พบข้อความ)"}
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