import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน!");
      return;
    }

    try {
      await api.post("/register", {
        username: username,
        password: password,
      });

      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      navigate("/"); 
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Username นี้มีคนใช้แล้ว กรุณาเปลี่ยนชื่อใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
        console.error(error);
      }
    }
  };

  return (
    <div className="main-container">
      <div className="auth-container">
        <h2>สมัครสมาชิกใหม่</h2>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div>
            <label style={{ display: "block", textAlign: "left", marginBottom: "5px", fontWeight: "bold" }}>Username</label>
            <input
              type="text"
              placeholder="ตั้งชื่อผู้ใช้งาน"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", textAlign: "left", marginBottom: "5px", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              placeholder="ตั้งรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", textAlign: "left", marginBottom: "5px", fontWeight: "bold" }}>Confirm Password</label>
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "20px" }}>
            ยืนยันการสมัคร
          </button>
        </form>

        <div style={{ marginTop: "20px" }}>
          <p>มีบัญชีอยู่แล้ว? <Link to="/" style={{ color: "#1890ff", fontWeight: "bold" }}>เข้าสู่ระบบที่นี่</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;