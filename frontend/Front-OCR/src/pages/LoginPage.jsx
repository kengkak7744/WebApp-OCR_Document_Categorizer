import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

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
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>เข้าสู่ระบบ OCR System</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <button type="submit" style={{ marginTop: "20px", padding: "10px 20px" }}>Login</button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <p>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิกที่นี่</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;