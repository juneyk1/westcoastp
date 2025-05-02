import React from 'react';
import './DocumentPage.css';
import Header from "./header";
import Appendices from "./Appendices";

export default function PrivacyPolicy() {
    return (
        <div>
            <Header/>
            <div className="document-page">
            <h1>Privacy Policy</h1>
            <iframe
                src="src/assets/IMD_Privacy_Policy.pdf"
                title="Privacy Policy"
                width="100%"
                height="800px"
                style={{ border: 'none' }}
            />
            </div>
            <Appendices/>
        </div>
    );
}