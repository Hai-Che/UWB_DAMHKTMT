import { Link, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import './profilePage.scss';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useContext(AuthContext);
  const handleLogout = async () => {
    try {
      await apiRequest.post('/auth/logout');
      updateUser(null);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>Thông tin người dùng</h1>
            <Link to="/profile/update">
              <button>Cập nhật thông tin</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser._doc.avatar || '/noavatar.jpg'} alt="" />
            </span>
            <span>
              Tên đăng nhập: <b>{currentUser._doc.username}</b>
            </span>
            <span>
              Email: <b>{currentUser._doc.email}</b>
            </span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
