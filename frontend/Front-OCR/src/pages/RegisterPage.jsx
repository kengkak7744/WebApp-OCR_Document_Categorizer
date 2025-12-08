import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

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
      // 4. ถ้า Error (เช่น ชื่อซ้ำ)
      if (error.response && error.response.status === 400) {
        alert("Username นี้มีคนใช้แล้ว กรุณาเปลี่ยนชื่อใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
        console.error(error);
      }
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>สมัครสมาชิกใหม่</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        
        <button type="submit" style={{ marginTop: "20px", padding: "10px 20px" }}>
          ยืนยันการสมัคร
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <p>มีบัญชีอยู่แล้ว? <Link to="/">เข้าสู่ระบบที่นี่</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;