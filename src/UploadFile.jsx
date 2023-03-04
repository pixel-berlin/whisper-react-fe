import React, { useState } from "react";

function UploadFile() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://flask-openai.onrender.com/whisper",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Uploaded file:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload File</button>
    </form>
  );
}

export default UploadFile;
