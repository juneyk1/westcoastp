import Header from './header'
import React from "react";

const Account = () => {
  return (
    
    <div>
        <Header />
      <h2 className="text-xl font-semibold mb-4">My account</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Private Info Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">PRIVATE INFO</h3>
          <p className="text-gray-600">
            <strong>Email</strong> <br />
            username@email.com{" "}
            <a href="#" className="text-blue-500 hover:underline">Change</a>
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Password</strong> <br />
            ***********{" "}
            <a href="#" className="text-blue-500 hover:underline">Change</a>
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Two-factor authentication</strong> <br />
            <span className="text-green-600 font-medium">Enabled</span>{" "}
            <a href="#" className="text-blue-500 hover:underline">Disable</a>
          </p>
        </div>

        {/* Profile Info Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">
            PROFILE INFO <a href="#" className="text-blue-500 hover:underline">VIEW PROFILE</a>
          </h3>
          <p className="text-gray-600">
            <strong>Username</strong> <br />
            flourish_user
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Name</strong> <br />
            Flourish User
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Organization</strong> <br />
            Flourish
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Organization type</strong> <br />
            Private Practice
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
