import { useState, useRef } from "react";

const mimeType = "audio/webm";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [file, setFile] = useState(null);
  const [text, setText] = useState(null);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    const media = new MediaRecorder(stream, { type: mimeType });

    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = async () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioFile = new File([audioBlob], "audio.webm", { type: mimeType });

      const formData = new FormData();
      formData.append("file", audioFile);

      try {
        const response = await fetch(
          "https://flask-openai.onrender.com/whisper",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        setText(data.text);
      } catch (error) {
        console.error("Error uploading audio:", error);
      }

      setAudioChunks([]);
    };
  };

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
    <div>
      <h2>sprache2text experiment</h2>
      <main>
        <div className="audio-controls">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
          {text && <p>{text}</p>}
        </div>
        {audio ? (
          <div className="audio-player">
            <audio src={audio} controls></audio>
            <a download href={audio}>
              Download Recording
            </a>
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleFileChange} />
              <button type="submit">Upload File</button>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AudioRecorder;
