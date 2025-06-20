import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import Papa from "papaparse";

function HomePage() {
  const [url, setUrl] = useState("");
  const [domains, setDomains] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data.map((row) => row[0]?.trim()).filter(Boolean);

        if (rows.length === 0) {
          alert("CSV file is empty.");
          return;
        }
        try {
          const { data: existingData } = await supabase
            .from("domains")
            .select("url");
          const existingUrls = new Set(existingData.map((d) => d.url));
          const newUrls = rows.filter((url) => url && !existingUrls.has(url));
          if (newUrls.length === 0) {
            alert("all URLs are already in the file.");
            return;
          }
          const insertData = newUrls.map((url) => ({ url }));
          const { error } = await supabase.from("domains").insert(insertData);

          if (error) {
            alert("Failed to import some URLs");
          } else {
            alert(`${insertData.length} URLs imported successfully!`);
            fetchDomains();
          }
        } catch (err) {
          alert("Error during import");
        }
      },

      error: (err) => {
        alert("Failed to parse CSV file");
      },
    });
  };

  const validUrl = (url) => {
    const pattern = /^https:\/\/www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/?$/;
    return pattern.test(url);
  };

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setDomains(data);
  };

  const addDomain = async () => {
    if (!url.trim()) return;

    if (!validUrl(url)) {
      alert("Please enter a valid URL in the format: https://www.example.com");
      return;
    }

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

  const exportUrls = async () => {
    const { data, error } = await supabase.from("domains").select("url");
    if (error) {
      alert("Failed tp fetch URLs for export");
      return;
    }
    const csvContent = ["URL", ...data.map((row) => row.url)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "domains_export.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ margin: "40px", maxWidth: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "32px",
            color: "black",
            margin: "8px",
          }}
        >
          Website Monitoring Tool
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept=".csv"
          id="csvInput"
          onChange={handleImport}
          style={{ display: "none" }}
        />
        <button
          onClick={() => document.getElementById("csvInput").click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            height: "50px",
            width: "100px",
          }}
        >
          Import
        </button>
        <button
          onClick={exportUrls}
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
        <button
          style=
          {{
            padding: "10px",
            height: "50px",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            color: "black",
          }}>
          Generate Screenshots
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
        <div
          style={{
            margin: "40px",
            backgroundColor: "white",
            borderRadius: "12px",
          }}
        >
          {domains.map((domain) => (
            <div
              key={domain.id}
              style={{
                marginBottom: "20px",
                height: "60px",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              <span>{domain.url}</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => startEdit(domain)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: "0 8px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/icons/editIcon.png"
                    alt="Edit"
                    style={{ height: "24px", width: "24px" }}
                  />
                </button>
                <button
                  onClick={() => deleteDomain(domain.id)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: "0 8px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/icons/deleteIcon.png"
                    alt="Delete"
                    style={{ height: "24px", width: "24px" }}
                  />
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
