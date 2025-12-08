import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      alert("Login สำเร็จ!");
      navigate("/upload");
    } catch (error) {
      alert("Login ไม่ผ่าน เช็คชื่อหรือรหัสผ่าน");
    }
  };

  return (
    <div className="auth-container">
      <h2>เข้าสู่ระบบ OCR System</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <input 
            type="text" placeholder="Username" 
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input 
            type="password" placeholder="Password" 
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <p>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิกที่นี่</Link></p>
      </div>
    </div>
  );
};
export default LoginPage;