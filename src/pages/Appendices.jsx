// File: src/components/AppendicesFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Appendices.css';

export default function Appendices() {
  return (
    <footer className="appendices-footer">
      <ul>
        <li>
          <Link to="/notices">Notice of Privacy Practices</Link>
        </li>
        <li>
          <Link to="/privacy">Privacy Policy</Link>
        </li>
      </ul>
    </footer>
  );
}
