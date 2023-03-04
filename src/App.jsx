import "./App.css";
import { useState, useRef } from "react";
import AudioRecorder from "../src/AudioRecorder";
import UploadFile from "./UploadFile";

const App = () => {
  let [recordOption, setRecordOption] = useState("video");
  const toggleRecordOption = (type) => {
    return () => {
      setRecordOption(type);
    };
  };
  return (
    <div>
      <div>
        <AudioRecorder />
      </div>
    </div>
  );
};
export default App;
