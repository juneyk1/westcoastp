import React from 'react';
import './DocumentPage.css';
import Header from "./header";
import Appendices from "./Appendices";

export default function NoticesOfPrivacyPractices() {
    return (
        <div>
            <Header/>
        <div className="document-page legal-notices-container">
          <h1>IMD Solutions, Inc. Notice of Privacy Practices</h1>
          <h2>Notice of Privacy Practices</h2>
          <p><strong>Effective Date of this Notice:</strong> April 10, 2025</p>
    
          <section>
            <h3>Your Information. Your Rights. Our Responsibilities.</h3>
            <p>
              This Notice of Privacy Practices (Notice) applies when IMD Solutions, Inc. is collecting, processing,
              holding, storing, or disclosing your individually identifiable health information that we collect as a
              health care provider subject to the Health Insurance Portability and Accountability Act (HIPAA).
            </p>
            <p>
              We collect and process protected health information through our IMD Solutions, Inc. GlucoGuard Product
              System when those Products are provided to you directly by us or by your doctor or hospital or other
              healthcare provider (Healthcare Provider) as a Product reimbursable (paid for by) insurance in the United
              States. This can include all protected information collected through the Products, but also collected and
              processed by IMD Solutions, Inc. through online activities and services we offer (websites, online store,
              surveys, newsletters, applications, email, messaging services, customer service centers, SMS/text,
              and otherwise).
            </p>
            <p><strong>This Notice does not apply when we:</strong></p>
            <ul>
              <li>Collect and process information in connection with our patient support or patient assistance programs</li>
              <li>Collect and process information to report adverse events or Product complaints</li>
              <li>Collect and process information in connection with your use of our website unrelated to insurance Products</li>
              <li>Collect and process information for any purpose other than to provide you with insurance-reimbursable Products</li>
            </ul>
            <p>Find out more about how information not subject to this Notice is used, disclosed, and your rights by visiting the IMD Solutions, Inc. Privacy Notice.</p>
          </section>
    
          <section>
            <h3>Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Get a copy of your paper or electronic medical record</li>
              <li>Ask us to correct your paper or electronic medical record</li>
              <li>Request confidential communications</li>
              <li>Ask us to limit the information we use or share</li>
              <li>Get a list of those with whom we’ve shared your information</li>
              <li>Get a copy of this privacy notice</li>
              <li>Choose someone to act for you</li>
              <li>File a complaint if you believe your privacy rights have been violated</li>
            </ul>
          </section>
    
          <section>
            <h3>Your Choices</h3>
            <p>
              For certain protected health information, you have choices in the way we use and share that information.
              If you have a clear preference for how we share your information in the situations described below, tell us
              and we will follow your instructions.
            </p>
            <p><strong>In these cases, you have both the right and choice to tell us to:</strong></p>
            <ul>
              <li>Share information with your family, close friends, or others involved in your care</li>
              <li>Share information in a disaster relief situation</li>
              <li>In some cases we never share your information unless you give us written permission</li>
            </ul>
          </section>
    
          <section>
            <h3>How We Use and Share Your Information</h3>
            <p><strong>We typically use or share your protected health information to:</strong></p>
            <ul>
              <li>Provide Products and services to you as part of your treatment</li>
              <li>Run our organization</li>
              <li>Bill for services</li>
            </ul>
            <p><strong>How else can we use or share your protected health information?</strong></p>
            <ul>
              <li>Help with public health and safety issues</li>
              <li>Do research</li>
              <li>Comply with the law</li>
              <li>Work with a medical examiner or funeral director</li>
              <li>Respond to lawsuits and legal actions</li>
              <li>Address workers’ compensation, law enforcement, and other government requests</li>
            </ul>
          </section>
    
          <section>
            <h3>Our Responsibilities</h3>
            <ul>
              <li>We are required by law to maintain the privacy and security of your protected health information.</li>
              <li>We will let you know promptly if a breach occurs that compromises your information.</li>
              <li>We must follow the duties and privacy practices described in this Notice and give you a copy.</li>
              <li>We will not use or share your protected health information other than as described here unless you tell us we can in writing. You may revoke permission at any time.</li>
            </ul>
          </section>
    
          <section>
            <h3>Changes to the Terms of this Notice</h3>
            <p>
              We can change the terms of this Notice, and the changes will apply to all protected health information we
              have about you. The new Notice will be available upon request and on our websites and Products. Please
              check frequently for any changes to this Notice.
            </p>
          </section>
    
          <section>
            <h3>Contact Us</h3>
            <p>For privacy inquiries, complaints, or to exercise any rights, contact us:</p>
            <ul>
              <li>Email: <a href="mailto:privacy@imdsolutions.com">privacy@imdsolutions.com</a></li>
              <li>Through our privacy portal</li>
              <li>
                By mail at:
                <address>
                  IMD Solutions, Inc.<br />
                  Attn: Data Privacy Officer<br />
                  21163 Newport Coast Drive<br />
                  Suite 576<br />
                  Newport Coast, CA 92657<br />
                  USA
                </address>
              </li>
            </ul>
          </section>
            </div>
            <Appendices/>
            </div>
      );
  }