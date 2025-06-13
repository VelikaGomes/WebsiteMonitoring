import React, { useState, useEffect } from 'react';
import  supabase  from '../supabaseClient';

function HomePage() {
  const [url, setUrl] = useState('');
  const [domains, setDomains] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setDomains(data);
  };

  const addDomain = async () => {
    if (!url.trim()) return;
    const { error } = await supabase.from('domains').insert([{ url }]);
    if (!error) {
      setUrl('');
      fetchDomains();
    } else {
      alert(error.message);
    }
  };

  const deleteDomain = async (id) => {
    await supabase.from('domains').delete().eq('id', id);
    fetchDomains();
  };

  const startEdit = (domain) => {
    setUrl(domain.url);
    setEditId(domain.id);
  };

  const updateDomain = async () => {
    if (!url.trim()) return;
    await supabase.from('domains').update({ url }).eq('id', editId);
    setUrl('');
    setEditId(null);
    fetchDomains();
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 40 }}>
      <h2>Domain URL Manager</h2>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Enter URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        {editId ? (
          <button onClick={updateDomain}>Update</button>
        ) : (
          <button onClick={addDomain}>Add</button>
        )}
      </div>

      <ul style={{ marginTop: 30 }}>
        {domains.map((domain) => (
          <li key={domain.id} style={{ marginBottom: 10 }}>
            <span>{domain.url}</span>
            <button onClick={() => startEdit(domain)} style={{ marginLeft: 10 }}>Edit</button>
            <button onClick={() => deleteDomain(domain.id)} style={{ marginLeft: 5 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
