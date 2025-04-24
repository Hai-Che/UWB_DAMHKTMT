import './login.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const res = await apiRequest.post('/auth/login', {
        username,
        password
      });
      updateUser(res.data);
      navigate('/home');
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>UWB - Đăng nhập</h1>
          <input required minLength={3} maxLength={20} name="username" type="text" placeholder="Tên đăng nhập" />
          <input required name="password" type="password" placeholder="Mật khẩu" />
          <button disabled={isLoading}>Đăng nhập</button>
          {error && <span>{error}</span>}
          <Link to="/register">Bạn chưa có tài khoản?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;
