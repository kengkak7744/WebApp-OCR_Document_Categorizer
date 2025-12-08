import { useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoCrop, setAutoCrop] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    console.log(autoCrop)
    formData.append("use_auto_crop", autoCrop.toString());

    try {
      const response = await api.post("/upload-document", formData);
      setResult(response.data); 
    } catch (error) {
      console.error(error);
      alert("อัปโหลดล้มเหลว หรือ Token หมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Upload Document (Auto-Crop)</h2>
        <div style={{ display: "flex", gap: "10px" }}>
        <Link to="/history">
            <button style={{ background: "#52c41a", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>
                History
            </button>
        </Link> 
        <button onClick={handleLogout} style={{ background: "#ff4d4f", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>
            Logout
        </button>
    </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <input 
                    type="checkbox" 
                    checked={autoCrop} 
                    onChange={(e) => setAutoCrop(e.target.checked)}
                    style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                เปิดใช้งาน Auto-Crop (บางรูปที่ขาวมากๆไม่สามารถใช้งานได้)
            </label>
        </div>
        <button onClick={handleUpload} disabled={loading || !file} style={{ marginLeft: "10px", padding: "8px 15px" }}>
          {loading ? "Processing..." : "Process OCR"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
            {result.original_image && (
              <div style={{ flex: 1, minWidth: "300px" }}>
                <h3>Original Image:</h3>
                <img src={result.original_image} alt="Original" style={{ width: "100%", border: "1px solid #ccc", borderRadius: "8px" }} />
              </div>
            )}
              {result.cropped_image && (
                <div style={{ flex: 1, minWidth: "300px" }}>
                <h3>Cropped Document:</h3>
                {result.original_image !== result.cropped_image ? (
                    <img src={result.cropped_image} alt="Cropped" style={{ width: "100%", border: "2px solid #1890ff", borderRadius: "8px" }} />
                ) : <p style={{color: '#666'}}>*(PDF file showing first page)*</p>}
              </div>
              )}
          </div>

          <h3>Extraction Result:</h3>
          <p><strong>Type:</strong> <span style={{backgroundColor: "#e6f7ff", padding: "2px 8px", borderRadius: "4px", color: "#1890ff"}}>{result.categories?.Type}</span></p>
          <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #eee", whiteSpace: "pre-wrap" }}>
            {result.extracted_text}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;