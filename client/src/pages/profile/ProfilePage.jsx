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
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser._doc.avatar || '/noavatar.jpg'} alt="" />
            </span>
            <span>
              Username: <b>{currentUser._doc.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser._doc.email}</b>
            </span>
            <button onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
