import Header from "./header";
import React, { useEffect } from "react";
import Appendices from "./Appendices";
import { useUserAuth } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../services/supabaseClient";
import { atom, useAtom } from "jotai";

// Atoms for state management
const userEmailAtom = atom("");
const isAddingAddressAtom = atom(false);
const editingAddressIdAtom = atom(null);
const newAddressAtom = atom({
  type: "both",
  first_name: "",
  last_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "United States",
  phone: "",
  is_default: false,
});

// Change password/email form atoms
const showChangeEmailAtom = atom(false);
const showChangePasswordAtom = atom(false);
const newEmailAtom = atom("");
const passwordDataAtom = atom({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formErrorAtom = atom(null);
const isRemovingAtom = atom(null);
const isSettingDefaultAtom = atom(null);
const changeFormErrorAtom = atom(null);
const changeFormSuccessAtom = atom(null);

const Account = () => {
  const {
    user,
    signOut,
    error: authError,
    resetError,
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    isLoading: authLoading,
  } = useUserAuth();

  const navigate = useNavigate();

  // State atoms
  const [userEmail, setUserEmail] = useAtom(userEmailAtom);
  const [isAddingAddress, setIsAddingAddress] = useAtom(isAddingAddressAtom);
  const [editingAddressId, setEditingAddressId] = useAtom(editingAddressIdAtom);
  const [newAddress, setNewAddress] = useAtom(newAddressAtom);
  const [showChangeEmail, setShowChangeEmail] = useAtom(showChangeEmailAtom);
  const [showChangePassword, setShowChangePassword] = useAtom(
    showChangePasswordAtom
  );
  const [newEmail, setNewEmail] = useAtom(newEmailAtom);
  const [passwordData, setPasswordData] = useAtom(passwordDataAtom);
  const [formError, setFormError] = useAtom(formErrorAtom);
  const [isRemoving, setIsRemoving] = useAtom(isRemovingAtom);
  const [isSettingDefault, setIsSettingDefault] = useAtom(isSettingDefaultAtom);
  const [changeFormError, setChangeFormError] = useAtom(changeFormErrorAtom);
  const [changeFormSuccess, setChangeFormSuccess] = useAtom(
    changeFormSuccessAtom
  );

  useEffect(() => {
    if (user) {
      setUserEmail(user.email);
    } else {
      navigate("/login");
    }
  }, [user, navigate, setUserEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setChangeFormError(null);
    setChangeFormSuccess(null);

    if (!newEmail || !newEmail.includes("@")) {
      setChangeFormError("Please enter a valid email address");
      return;
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;

      setChangeFormSuccess("Verification email sent. Please check your inbox.");
      setTimeout(() => {
        setShowChangeEmail(false);
      }, 3000);
    } catch (err) {
      setChangeFormError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeFormError(null);
    setChangeFormSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setChangeFormError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setChangeFormError("Password must be at least 6 characters");
      return;
    }

    try {
      const { error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: user.email,
          password: passwordData.currentPassword,
        });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      const { error } = await supabaseClient.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setChangeFormSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowChangePassword(false);
      }, 3000);
    } catch (err) {
      setChangeFormError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      let result;
      if (editingAddressId) {
        result = await updateAddress(editingAddressId, newAddress);
      } else {
        result = await addAddress(newAddress);
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save address");
      }

      setIsAddingAddress(false);
      setEditingAddressId(null);
      resetForm();
    } catch (err) {
      setFormError(err.message);
      console.error("Error saving address:", err);
    }
  };

  const startEditing = (address) => {
    setEditingAddressId(address.id);
    setNewAddress(address);
    setIsAddingAddress(true);
  };

  const resetForm = () => {
    setNewAddress({
      type: "both",
      first_name: "",
      last_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "United States",
      phone: "",
      is_default: false,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (authError && !user) {
    return (
      <div>
        <Header />
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {authError}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </button>
        </div>
        <Appendices />
      </div>
    );
  }

  // Filter addresses by type with default addresses first
  const shippingAddresses = addresses
    .filter((addr) => addr.type === "shipping" || addr.type === "both")
    .sort((a, b) => b.is_default - a.is_default);

  const billingAddresses = addresses
    .filter((addr) => addr.type === "billing" || addr.type === "both")
    .sort((a, b) => b.is_default - a.is_default);

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">My account</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Private Info Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3">PRIVATE INFO</h3>
            <p className="text-gray-600">
              <strong>Email</strong> <br />
              {userEmail}
              <button
                onClick={() => {
                  setShowChangeEmail(!showChangeEmail);
                  setShowChangePassword(false);
                  setChangeFormError(null);
                  setChangeFormSuccess(null);
                  setNewEmail(userEmail);
                }}
                className="text-blue-500 hover:underline ml-2"
              >
                Change
              </button>
            </p>

            {/* Change Email Form */}
            {showChangeEmail && (
              <div className="mt-3 p-4 bg-gray-50 rounded">
                <h4 className="text-md font-medium mb-2">Change Email</h4>
                {changeFormError && (
                  <p className="text-red-500 text-sm mb-2">{changeFormError}</p>
                )}
                {changeFormSuccess && (
                  <p className="text-green-500 text-sm mb-2">
                    {changeFormSuccess}
                  </p>
                )}
                <form onSubmit={handleChangeEmail}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Update Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(false)}
                      className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <p className="text-gray-600 mt-3">
              <strong>Password</strong> <br />
              **********
              <button
                onClick={() => {
                  setShowChangePassword(!showChangePassword);
                  setShowChangeEmail(false);
                  setChangeFormError(null);
                  setChangeFormSuccess(null);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="text-blue-500 hover:underline ml-2"
              >
                Change
              </button>
            </p>

            {/* Change Password Form */}
            {showChangePassword && (
              <div className="mt-3 p-4 bg-gray-50 rounded">
                <h4 className="text-md font-medium mb-2">Change Password</h4>
                {changeFormError && (
                  <p className="text-red-500 text-sm mb-2">{changeFormError}</p>
                )}
                {changeFormSuccess && (
                  <p className="text-green-500 text-sm mb-2">
                    {changeFormSuccess}
                  </p>
                )}
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordDataChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordDataChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordDataChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3">
              PROFILE INFO
              <a href="/profile" className="text-blue-500 hover:underline ml-2">
                VIEW PROFILE
              </a>
            </h3>
            <p className="text-gray-600">
              <strong>Username</strong> <br />
              {user.user_metadata?.username || "flourish_user"}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Name</strong> <br />
              {user.user_metadata?.full_name || "Flourish User"}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Organization</strong> <br />
              {user.user_metadata?.organization || "Flourish"}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Organization type</strong> <br />
              {user.user_metadata?.organization_type || "Private Practice"}
            </p>
            <button
              onClick={() => navigate("/edit-profile")}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Address Management Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">MY ADDRESSES</h3>
            <button
              onClick={() => {
                resetForm();
                setIsAddingAddress(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add New Address
            </button>
          </div>

          {isAddingAddress && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h4 className="text-lg font-medium mb-4">
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h4>
              {formError && (
                <div className="text-red-500 mb-4">{formError}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      name="type"
                      value={newAddress.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="both">Shipping & Billing</option>
                      <option value="shipping">Shipping Only</option>
                      <option value="billing">Billing Only</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      name="is_default"
                      checked={newAddress.is_default}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          is_default: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    <label htmlFor="is_default">Set as default address</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={newAddress.first_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={newAddress.last_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      value={newAddress.address_line1}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={newAddress.address_line2}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={newAddress.postal_code}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={newAddress.country}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setEditingAddressId(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Shipping Addresses Section */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Shipping Addresses</h4>
            {shippingAddresses.length === 0 ? (
              <p className="text-gray-500">No shipping addresses saved</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-4 relative"
                  >
                    {address.is_default && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <div className="mb-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          address.type === "both"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {address.type === "both"
                          ? "Shipping & Billing"
                          : "Shipping Only"}
                      </span>
                    </div>
                    <p className="font-medium">
                      {address.first_name} {address.last_name}
                    </p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && (
                      <p className="mt-2">Phone: {address.phone}</p>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="text-blue-500 hover:underline text-sm"
                        disabled={
                          isRemoving === address.id ||
                          isSettingDefault === address.id
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          setIsRemoving(address.id);
                          try {
                            await removeAddress(address.id);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsRemoving(null);
                          }
                        }}
                        className="text-red-500 hover:underline text-sm"
                        disabled={
                          isRemoving === address.id ||
                          isSettingDefault === address.id
                        }
                      >
                        {isRemoving === address.id ? "Removing..." : "Remove"}
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={async () => {
                            setIsSettingDefault(address.id);
                            try {
                              await setDefaultAddress(address.id);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setIsSettingDefault(null);
                            }
                          }}
                          className="text-gray-500 hover:underline text-sm"
                          disabled={
                            isRemoving === address.id ||
                            isSettingDefault === address.id
                          }
                        >
                          {isSettingDefault === address.id
                            ? "Setting..."
                            : "Set as default"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing Addresses Section */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Billing Addresses</h4>
            {billingAddresses.length === 0 ? (
              <p className="text-gray-500">No billing addresses saved</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {billingAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-4 relative"
                  >
                    {address.is_default && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <div className="mb-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          address.type === "both"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {address.type === "both"
                          ? "Shipping & Billing"
                          : "Billing Only"}
                      </span>
                    </div>
                    <p className="font-medium">
                      {address.first_name} {address.last_name}
                    </p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && (
                      <p className="mt-2">Phone: {address.phone}</p>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="text-blue-500 hover:underline text-sm"
                        disabled={
                          isRemoving === address.id ||
                          isSettingDefault === address.id
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          setIsRemoving(address.id);
                          try {
                            await removeAddress(address.id);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsRemoving(null);
                          }
                        }}
                        className="text-red-500 hover:underline text-sm"
                        disabled={
                          isRemoving === address.id ||
                          isSettingDefault === address.id
                        }
                      >
                        {isRemoving === address.id ? "Removing..." : "Remove"}
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={async () => {
                            setIsSettingDefault(address.id);
                            try {
                              await setDefaultAddress(address.id);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setIsSettingDefault(null);
                            }
                          }}
                          className="text-gray-500 hover:underline text-sm"
                          disabled={
                            isRemoving === address.id ||
                            isSettingDefault === address.id
                          }
                        >
                          {isSettingDefault === address.id
                            ? "Setting..."
                            : "Set as default"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order History Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">ORDER HISTORY</h3>
          <div className="border-t pt-4">
            <a
              href="/orders"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Order History
            </a>
          </div>
        </div>

        {/* Subscription Management Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">MY SUBSCRIPTIONS</h3>
          <div className="border-t pt-4">
            <a
              href="/subscriptions"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Subscriptions
            </a>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">PAYMENT METHODS</h3>
          <div className="border-t pt-4">
            <a
              href="/payment-methods"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Payment Methods
            </a>
          </div>
        </div>
      </div>
      <Appendices />
    </div>
  );
};

export default Account;
