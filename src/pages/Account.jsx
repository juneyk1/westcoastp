import Header from "./header";
import React, { useEffect, useState } from "react";
import { UserAuth } from "../contexts/AuthContexts";

const Account = () => {
  const { 
    user, 
    signOut, 
    loading, 
    error,
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress
  } = UserAuth();
  
  const [userEmail, setUserEmail] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: 'both',
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    is_default: false
  });
  const [formError, setFormError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isSettingDefault, setIsSettingDefault] = useState(null);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
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
      type: 'both',
      first_name: '',
      last_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      phone: '',
      is_default: false
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading && !user) {
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

  // Filter addresses by type with default addresses first
  const shippingAddresses = addresses
    .filter(addr => addr.type === 'shipping' || addr.type === 'both')
    .sort((a, b) => b.is_default - a.is_default);
    
  const billingAddresses = addresses
    .filter(addr => addr.type === 'billing' || addr.type === 'both')
    .sort((a, b) => b.is_default - a.is_default);

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">My account</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Private Info Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">PRIVATE INFO</h3>
            <p className="text-gray-600">
              <strong>Email</strong> <br />
              {userEmail}
              <a href="#" className="text-blue-500 hover:underline ml-2">
                Change
              </a>
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Password</strong> <br />
              **********
              <a href="#" className="text-blue-500 hover:underline ml-2">
                Change
              </a>
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Two-factor authentication</strong> <br />
              <span className="text-green-600 font-medium">Enabled</span>
              <a href="#" className="text-blue-500 hover:underline ml-2">
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
              PROFILE INFO
              <a href="#" className="text-blue-500 hover:underline ml-2">
                VIEW PROFILE
              </a>
            </h3>
            <p className="text-gray-600">
              <strong>Username</strong> <br />
              {user.user_metadata?.username || 'flourish_user'}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Name</strong> <br />
              {user.user_metadata?.full_name || 'Flourish User'}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Organization</strong> <br />
              {user.user_metadata?.organization || 'Flourish'}
            </p>
            <p className="text-gray-600 mt-3">
              <strong>Organization type</strong> <br />
              {user.user_metadata?.organization_type || 'Private Practice'}
            </p>
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
              disabled={loading}
            >
              Add New Address
            </button>
          </div>

          {isAddingAddress && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h4 className="text-lg font-medium mb-4">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h4>
              {formError && (
                <div className="text-red-500 mb-4">{formError}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
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
                      onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="is_default">Set as default address</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={newAddress.address_line2}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
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
                {shippingAddresses.map(address => (
                  <div key={address.id} className="border rounded-lg p-4 relative">
                    {address.is_default && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        address.type === 'both' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {address.type === 'both' ? 'Shipping & Billing' : 'Shipping Only'}
                      </span>
                    </div>
                    <p className="font-medium">{address.first_name} {address.last_name}</p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="text-blue-500 hover:underline text-sm"
                        disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
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
                        disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
                      >
                        {isRemoving === address.id ? 'Removing...' : 'Remove'}
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
                          disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
                        >
                          {isSettingDefault === address.id ? 'Setting...' : 'Set as default'}
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
                {billingAddresses.map(address => (
                  <div key={address.id} className="border rounded-lg p-4 relative">
                    {address.is_default && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        address.type === 'both' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {address.type === 'both' ? 'Shipping & Billing' : 'Billing Only'}
                      </span>
                    </div>
                    <p className="font-medium">{address.first_name} {address.last_name}</p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="text-blue-500 hover:underline text-sm"
                        disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
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
                        disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
                      >
                        {isRemoving === address.id ? 'Removing...' : 'Remove'}
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
                          disabled={loading || isRemoving === address.id || isSettingDefault === address.id}
                        >
                          {isSettingDefault === address.id ? 'Setting...' : 'Set as default'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;