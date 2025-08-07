import React from "react";

const ContactList = ({ contacts, updateContact, updateCallback }) => {
  const onDelete = async (id) => {
    try {
      const options = {
        method: "DELETE",
      };
      const response = await fetch(
        `http://127.0.0.1:5000/delete_contact/${id}`,
        options
      );

      if (response.status === 200) {
        updateCallback();
      } else {
        console.error("Failed to delete contact:", await response.json());
        // Optionally handle error in frontend (e.g., display message)
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      // Optionally handle error in frontend (e.g., display message)
    }
  };

  return (
    <div>
      <h2>Registered Users</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.username}</td>
              <td>{contact.password}</td>
              <td>{contact.role}</td>
              <td>
                <button onClick={() => onDelete(contact.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;