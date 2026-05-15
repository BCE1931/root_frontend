import React, { useState } from "react";
import { X, Check, User } from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f59e0b","#10b981","#3b82f6","#14b8a6",
];

export const PROFILE_KEY = "user_profile";

export function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; }
}
export function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}
export function getDisplayName(profile) {
  const fn = profile.firstName || "";
  const ln = profile.lastName  || "";
  return (fn + " " + ln).trim() || "Sasan";
}
export function getInitial(profile) {
  return (profile.firstName?.[0] || "S").toUpperCase();
}
export function getAvatarColor(profile) {
  return profile.avatarColor || "#6366f1";
}

export default function ProfileEditModal({ onClose, onSave }) {
  const init = getProfile();
  const [firstName,   setFirstName]   = useState(init.firstName   || "Sasan");
  const [lastName,    setLastName]    = useState(init.lastName    || "Reddy");
  const [email,       setEmail]       = useState(init.email       || "sasankreddy2211@gmail.com");
  const [phone,       setPhone]       = useState(init.phone       || "");
  const [bio,         setBio]         = useState(init.bio         || "");
  const [avatarColor, setAvatarColor] = useState(init.avatarColor || "#6366f1");

  const handleSave = () => {
    const data = { firstName, lastName, email, phone, bio, avatarColor };
    saveProfile(data);
    onSave?.(data);
    onClose();
  };

  return (
    <div className="pem-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pem-modal">

        <div className="pem-header">
          <span className="pem-title"><User size={15} /> Edit Profile</span>
          <button className="pem-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Avatar preview + color picker */}
        <div className="pem-avatar-section">
          <div className="pem-avatar-preview" style={{ background: avatarColor }}>
            {(firstName?.[0] || "S").toUpperCase()}
          </div>
          <div className="pem-color-grid">
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                className={`pem-color-dot${avatarColor === c ? " active" : ""}`}
                style={{ background: c }}
                onClick={() => setAvatarColor(c)}
                title={c}
              >
                {avatarColor === c && <Check size={10} color="white" />}
              </button>
            ))}
          </div>
          <span className="pem-avatar-hint">Choose avatar color</span>
        </div>

        <div className="pem-fields">
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">First Name</label>
              <input
                className="pem-input"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">Last Name</label>
              <input
                className="pem-input"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="pem-field">
            <label className="pem-label">Email</label>
            <input
              className="pem-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="pem-field">
            <label className="pem-label">Phone Number</label>
            <input
              className="pem-input"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="pem-field">
            <label className="pem-label">Bio</label>
            <textarea
              className="pem-input pem-textarea"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A short note about your learning goals…"
              rows={2}
            />
          </div>
        </div>

        <div className="pem-footer">
          <button className="pem-cancel" onClick={onClose}>Cancel</button>
          <button className="pem-save" onClick={handleSave}>
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
