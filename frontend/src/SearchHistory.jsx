import React, { useEffect, useState } from "react";

const SearchHistoryPage = ({ user }) => {
  const [history, setHistory] = useState([]);

// allows fetching of a specified username (user ccan only see their own searches in the database)
  const fetchHistory = async () => {
    const response = await fetch(`http://127.0.0.1:5000/search_history/${user.username}`);
    const data = await response.json();
    setHistory(data);
  };

  // allows deletion of a specific search
  const deleteEntry = async (id) => {
    await fetch(`http://127.0.0.1:5000/search_history/${id}`, { method: "DELETE" });
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Your Search History</h2>
      <ul>
        {history.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.search_query}</strong>
            <button onClick={() => deleteEntry(entry.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistoryPage;