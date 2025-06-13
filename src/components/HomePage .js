import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function HomePage() {
  const [url, setUrl] = useState("");
  const [domains, setDomains] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setDomains(data);
  };

  const addDomain = async () => {
    if (!url.trim()) return;
    const { error } = await supabase.from("domains").insert([{ url }]);
    if (!error) {
      setUrl("");
      fetchDomains();
    } else {
      alert(error.message);
    }
  };

  const deleteDomain = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this URL?"
    );
    if (!confirmDelete) return;

    await supabase.from("domains").delete().eq("id", id);
    fetchDomains();
  };

  const startEdit = (domain) => {
    setUrl(domain.url);
    setEditId(domain.id);
  };

  const updateDomain = async () => {
    if (!url.trim()) return;
    await supabase.from("domains").update({ url }).eq("id", editId);
    setUrl("");
    setEditId(null);
    fetchDomains();
  };

  return (
    <div className="container" style={{ margin: "40px" }}>
      <h2>Website Monitoring Tool</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          style={{
            padding: "10px",
            color: "black",
            height: "50px",
            width: "100px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Import
        </button>
        <button
          style={{
            padding: "10px",
            height: "50px",
            width: "100px",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Export
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            padding: "10px",
            height: "50px",
            width: "100px",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
          }}
        >
          {showAll ? "Hide" : "View"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          margin: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, height: "40px", width: "40%" }}
        />
        {editId ? (
          <button
            onClick={updateDomain}
            style={{
              height: "50px",
              width: "100px",
              padding: "15px",
              backgroundColor: "#0A1172",
              color: "white",
              fontWeight: "bold",
              borderRadius: "10px",
            }}
          >
            Update
          </button>
        ) : (
          <button
            onClick={addDomain}
            style={{
              height: "50px",
              width: "100px",
              padding: "15px",
              backgroundColor: "#0A1172",
              color: "white",
              fontWeight: "bold",
              borderRadius: "10px",
            }}
          >
            Add
          </button>
        )}
      </div>

      {showAll && (
        <div style={{ margin: "40px" }}>
          {domains.map((domain) => (
            <div
              key={domain.id}
              style={{
                marginBottom: "20px",
                padding: "10px",
                backgroundColor:"",
                borderRadius: "8px",
              }}
            >
              <span>{domain.url}</span>
              <div>
                <button
                  onClick={() => startEdit(domain)}
                  style={{
                    margin: "5px",
                    height: "40px",
                    width: "80px",
                    padding: "15px",
                    backgroundColor: "#0A1172",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDomain(domain.id)}
                  style={{
                    height: "40px",
                    width: "80px",
                    margin: "5px",
                    padding: "15px",
                    backgroundColor: "#0A1172",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;