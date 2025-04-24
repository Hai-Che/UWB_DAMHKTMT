import { useContext, useState } from 'react';
import './profileUpdatePage.scss';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';
import UploadWidget from '../../components/uploadWidget/UploadWidget';
function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState([]);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await apiRequest.put(`/users/${currentUser._doc._id}`, {
        username,
        email,
        password,
        avatar: avatar[0]
      });
      updateUser(res.data);
      navigate('/profile');
    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    }
  };
  return (
    <div className="profileUpdatePage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Cập nhật thông tin</h1>
          <div className="item">
            <label htmlFor="username">Tên đăng nhập</label>
            <input id="username" name="username" type="text" defaultValue={currentUser._doc.username} />
          </div>
          <div className="item">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" defaultValue={currentUser._doc.email} />
          </div>
          <div className="item">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" />
          </div>
          {error && <span>{error}</span>}
          <button>Cập nhật</button>
        </form>
      </div>
      <div className="sideContainer">
        <img src={avatar[0] || currentUser._doc.avatar || '/noavatar.jpg'} alt="" className="avatar" />
        <UploadWidget
          uwConfig={{
            cloudName: 'lah',
            uploadPreset: 'estate',
            multiple: false,
            maxImageFileSize: 2000000,
            folder: 'avatars'
          }}
          setState={setAvatar}
        />
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
