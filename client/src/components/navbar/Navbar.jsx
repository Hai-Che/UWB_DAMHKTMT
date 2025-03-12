import { useContext } from 'react';
import './navbar.scss';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="navbar">
      <div className="left">
        <div className="logo">
          <img src="/hcmut.png" alt="" />
          <span>UWB Indoor Localization</span>
        </div>
      </div>
      <div className="right">
        {currentUser ? (
          <div className="user">
            <img src={currentUser._doc.avatar || '/noavatar.jpg'} alt="" />
            <span>{currentUser._doc.username}</span>
            <Link to="/profile" className="profile">
              {/* {number > 0 && <div className="notification">{number}</div>} */}
              <span>Profile</span>
            </Link>
          </div>
        ) : (
          <>
            <a href="/">Sign in</a>
            <a href="/register" className="register">
              Sign up
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
