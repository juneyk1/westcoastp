import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../contexts/AuthContexts";
import supabaseClient from "../services/supabaseClient";

export const ProfileSection = () => {
  const [user] = useAtom(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    organization: "",
    organization_type: "Private Practice"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;
        
        if (data) {
          const profile = data[0];
          setFormData({
            username: profile.username || "",
            full_name: profile.full_name || "",
            organization: profile.organization || "",
            organization_type: profile.organization_type || "Private Practice"
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: formData.username,
          full_name: formData.full_name,
          organization: formData.organization,
          organization_type: formData.organization_type,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h3 className="text-lg font-medium mb-4">PROFILE INFO</h3>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">PROFILE INFO</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:underline text-sm"
          >
            EDIT PROFILE
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type
            </label>
            <select
              name="organization_type"
              value={formData.organization_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Private Practice">Private Practice</option>
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="University">University</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Username</p>
            <p className="text-gray-600">{formData.username || "Not set"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Full Name</p>
            <p className="text-gray-600">{formData.full_name || "Not set"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Organization</p>
            <p className="text-gray-600">{formData.organization || "Not set"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Organization Type</p>
            <p className="text-gray-600">{formData.organization_type || "Not set"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;