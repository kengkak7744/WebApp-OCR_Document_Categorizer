import { useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload-document", formData);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("อัปโหลดล้มเหลว หรือ Token หมดอายุ");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Upload Document</h2>
        <button onClick={handleLogout} style={{ background: "red", color: "white" }}>Logout</button>
      </div>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Process OCR</button>

      {result && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>ผลลัพธ์:</h3>
          <p><strong>ประเภทเอกสาร:</strong> {result.categories?.Type}</p>
          <p><strong>ข้อความที่อ่านได้:</strong></p>
          <pre style={{ background: "#000000", padding: "10px" }}>
            {result.extracted_text}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UploadPage;