// components/Footer.js
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} SSB Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
