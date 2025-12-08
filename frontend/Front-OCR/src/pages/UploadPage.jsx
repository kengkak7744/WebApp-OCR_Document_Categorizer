import { useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./UploadPage.css";
import "../App.css";

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
    <div className="main-container">
      <div className="page-header">
        <h2>Upload Document</h2>
        <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/history"><button className="btn btn-success">History</button></Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      <div className="upload-box">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
        
        <div className="toggle-container">
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} style={{ marginRight: "8px" }} />
                  ปิดใช้งาน Auto-Crop
            </label>
        </div>

        <button onClick={handleUpload} disabled={loading || !file} className="btn btn-primary" style={{ marginTop: "15px" }}>
          {loading ? "Processing..." : "Process OCR"}
        </button>
      </div>

      {result && (
        <div className="result-section">
          <div className="image-preview-container">
            {result.original_image && (
              <div className="image-box">
                <h3>Original:</h3>
                <img src={result.original_image} className="img-original" />
              </div>
            )}
            {result.cropped_image && (
               <div className="image-box">
               <h3>Result:</h3>
               <img src={result.cropped_image} className="img-cropped" />
             </div>
            )}
          </div>

          <h3>Extraction Result:</h3>
          <div className="text-result-box">
            {result.extracted_text}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;