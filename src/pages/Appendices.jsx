import React, { useState } from "react";
import "./Appendices.css";
export default function Appendices() {
  return (
    <div className="legal-notices-container text-xl">
      <h1>Legal Notices</h1>

      <section className="terms-of-use justify-self-end">
        <h2 className="">Terms of Use</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.. You can access
          the full Terms of Use{" "}
          <a
            href="insert link to actual Terms of Use"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
        <ul>
          <li>Account Creation and Management</li>
          <li>Use of Services</li>
          <li>Intellectual Property</li>
        </ul>
      </section>

      <section className="privacy-notice">
        <h2>Privacy Notice</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.. You can access
          the full Privacy Notice{" "}
          <a
            href="insert link to actual Amazon Privacy Notice"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
        <ul>
          <li>Information Collection</li>
          <li>Use of Information</li>
          <li>Sharing of Information</li>
        </ul>
      </section>

      <section className="copyright-trademark">
        <h2>Copyright and Trademark Information</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. For inquiries
          regarding copyright or trademark use, please contact{" "}
          <a href="mailto:insert contact email">us</a>.{" "}
        </p>
      </section>

      <section className="other-notices">
        <h2>Other Legal Notices</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </section>

      <section className="contact-information">
        <h2>Contact Information</h2>
        <p>For any legal inquiries, please contact us at:</p>
        <address>
          Legal Department
          <br />
          [Insert Address or Link to Contact Page]
        </address>
      </section>
    </div>
  );
}
