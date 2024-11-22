import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFilm, faShoppingCart, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">StreamList</Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Link>
          </li>
          <li>
            <Link to="/movies" className={location.pathname === '/movies' ? 'active' : ''}>
              <FontAwesomeIcon icon={faFilm} /> Movies
            </Link>
          </li>
          <li>
            <Link to="/cart" className={location.pathname === '/cart' ? 'active' : ''}>
              <FontAwesomeIcon icon={faShoppingCart} /> Cart
            </Link>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              <FontAwesomeIcon icon={faInfoCircle} /> About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
