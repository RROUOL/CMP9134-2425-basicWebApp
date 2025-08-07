import React, { useState, useEffect } from "react";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import ImageSearch from "./ImageSearch";
import Register from "./RegisterContact"
import Login from "./LoginContact";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({});
  const [activeTab, setActiveTab] = useState('images');
  const [isRegistering, setIsRegistering] = useState(true);
  const [user, setUser] = useState(null); // when logged in, user info is stored here

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    const response = await fetch("http://localhost:5000/contacts");
    const data = await response.json();
    setContacts(data.contacts);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact({});
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    if (isModalOpen) return;
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const onUpdate = () => {
    closeModal();
    fetchContacts();
  };

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('images');
  };

  if (!user) {
    return isRegistering ? (
      <>
        <Register onRegister={handleLogin} />
        <p>Already have an account? <button onClick={() => setIsRegistering(false)}>Log In</button></p>
      </>
    ) : (
      <>
        <Login onLogin={handleLogin} />
        <p>Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button></p>
      </>
    );
  }


  return (
    <>
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Image Search
        </button>

        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          My Searches
        </button>

        {user.role === 'admin' && (
          <button
            className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            User List
          </button>
        )}


        <span style={{ marginLeft: "auto" }}>
          Logged in as <strong>{user.username}</strong> ({user.role})
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>Logout</button>
        </span>
      </div>

      {activeTab === 'contacts' && user.role === 'admin' && (
        <div className="contacts-tab">
          <ContactList contacts={contacts} updateContact={openEditModal} updateCallback={onUpdate} />
          <button onClick={openCreateModal}>Create New Contact</button>
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <ContactForm existingContact={currentContact} updateCallback={onUpdate} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'images' && (
        <div className="images-tab">
          <ImageSearch />
        </div>
      )}
    </>
  );
}

export default App;
