import Header from "./header";
import React, { useEffect, useState } from "react";
// import { UserAuth } from ".../contexts/AuthContext"; // Pull the context we are working in
import { UserAuth } from "../contexts/AuthContexts"

const Account = () => {
  const { user, signOut, loading, error } = UserAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (user) {
      setUserEmail(user.email);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <p>Loading account information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header />
        <p>You are not logged in.</p>
      </div>
    );
  }

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
            {userEmail} {/* Display user's email */}
            <a href="#" className="text-blue-500 hover:underline">
              Change
            </a>
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Password</strong> <br />
            **********{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Change
            </a>
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Two-factor authentication</strong> <br />
            <span className="text-green-600 font-medium">Enabled</span>{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Disable
            </a>
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Info Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">
            PROFILE INFO{" "}
            <a href="#" className="text-blue-500 hover:underline">
              VIEW PROFILE
            </a>
          </h3>
          <p className="text-gray-600">
            <strong>Username</strong> <br />
            flourish_user {/* Replace with actual username if available */}
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Name</strong> <br />
            Flourish User {/* Replace with actual name if available */}
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Organization</strong> <br />
            Flourish {/* Replace with actual organization if available */}
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Organization type</strong> <br />
            Private Practice{" "}
            {/* Replace with actual organization type if available */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
