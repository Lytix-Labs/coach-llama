// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import { Button, Dropdown, Space, Alert, Modal } from 'antd';
import { askGPT, handleAskGPT, optimodel, OptiModel } from "./api";
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { InfoCircleOutlined } from "@ant-design/icons/lib";

class DetectedPose {
  constructor(pose) {
    this.score = pose.score;
    this.keypoints = pose.keypoints.reduce((acc, keypoint) => {
      acc[keypoint.part] = {
        score: keypoint.score,
        position: keypoint.position
      };
      return acc;
    }, {});
  }

  getPart(part) {
    return this.keypoints[part];
  }
}

class RelevantBodyParts {
  constructor(pose) {
    this.leftWrist = pose.keypoints.find(k => k.part === "leftWrist").position;
    this.rightWrist = pose.keypoints.find(k => k.part === "rightWrist").position;
    this.leftElbow = pose.keypoints.find(k => k.part === "leftElbow").position;
    this.rightElbow = pose.keypoints.find(k => k.part === "rightElbow").position;
    this.leftShoulder = pose.keypoints.find(k => k.part === "leftShoulder").position;
    this.rightShoulder = pose.keypoints.find(k => k.part === "rightShoulder").position;
    this.timeStamp = Date.now();
  }
}

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false); 
  const [responseText, setResponseText] = useState(""); // State for OpenAI response

  
  const toggleWebcam = () => {
    setIsWebcamOn((prev) => !prev); // Toggle webcam state
  };
  // handling alerts

  
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const showInfoModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const showErrorModal = () => {
    setIsModalOpen(true);
  };
  const handleErrorOk = () => {
    setIsModalOpen(false);
  };
  const handleErrorCancel = () => {
    setIsModalOpen(false);
  };

  const entries = [
    "Left Wrist: (583.113, 347.193), Right Wrist: (493.240, 487.489), Left Elbow: (594.539, 367.172), Right Elbow: (603.330, 354.642), Left Shoulder: (475.783, 489.596), Right Shoulder: (202.388, 484.838)",
    "Left Wrist: (142.053, 373.888), Right Wrist: (134.237, 376.746), Left Elbow: (133.562, 368.041), Right Elbow: (135.840, 379.704), Left Shoulder: (393.630, 431.430), Right Shoulder: (203.485, 477.913)",
    "Left Wrist: (127.947, 327.165), Right Wrist: (121.818, 326.796), Left Elbow: (474.092, 486.892), Right Elbow: (147.750, 494.291), Left Shoulder: (451.518, 494.335), Right Shoulder: (200.986, 479.698)",
    "Left Wrist: (176.818, 325.593), Right Wrist: (168.163, 330.268), Left Elbow: (185.576, 332.789), Right Elbow: (41.268, 492.867), Left Shoulder: (472.528, 488.495), Right Shoulder: (218.727, 466.228)",
    "Left Wrist: (176.818, 325.593), Right Wrist: (168.163, 330.268), Left Elbow: (185.576, 332.789), Right Elbow: (41.268, 492.867), Left Shoulder: (472.528, 488.495), Right Shoulder: (218.727, 466.228)",
    "Left Wrist: (592.374, 244.229), Right Wrist: (262.326, 370.451), Left Elbow: (495.475, 468.679), Right Elbow: (48.948, 482.143), Left Shoulder: (472.966, 490.011), Right Shoulder: (231.517, 475.251)",
    "Left Wrist: (594.829, 248.773), Right Wrist: (239.341, 341.262), Left Elbow: (493.599, 469.579), Right Elbow: (620.195, 425.951), Left Shoulder: (468.717, 487.186), Right Shoulder: (224.966, 490.613)",
    "Left Wrist: (516.561, 228.561), Right Wrist: (160.870, 249.832), Left Elbow: (496.080, 467.540), Right Elbow: (459.125, 467.879), Left Shoulder: (453.729, 480.892), Right Shoulder: (213.982, 480.717)",
    "Left Wrist: (516.561, 228.561), Right Wrist: (160.870, 249.832), Left Elbow: (496.080, 467.540), Right Elbow: (459.125, 467.879), Left Shoulder: (453.729, 480.892), Right Shoulder: (213.982, 480.717)",
    "Left Wrist: (483.508, 257.139), Right Wrist: (217.917, 244.623), Left Elbow: (627.141, 448.807), Right Elbow: (594.421, 444.929), Left Shoulder: (454.571, 482.575), Right Shoulder: (207.157, 478.835)",
    "Left Wrist: (467.317, 246.344), Right Wrist: (212.503, 249.797), Left Elbow: (630.617, 444.721), Right Elbow: (158.378, 483.993), Left Shoulder: (454.511, 483.225), Right Shoulder: (218.515, 480.289)",
    "Left Wrist: (208.063, 310.182), Right Wrist: (201.278, 311.511), Left Elbow: (501.145, 467.091), Right Elbow: (141.102, 492.053), Left Shoulder: (447.633, 485.922), Right Shoulder: (216.893, 470.619)",
    "Left Wrist: (585.303, 447.604), Right Wrist: (582.015, 455.191), Left Elbow: (353.052, 396.972), Right Elbow: (201.625, 426.615), Left Shoulder: (463.783, 497.847), Right Shoulder: (219.493, 390.697)",
  ];

  const savedRelevantBodyParts = useRef([]);
  
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false); // State to manage recording status`

  const drawCanvas = (pose, video, videoWidth, videoHeight) => {
    const ctx = canvasRef.current?.getContext("2d"); // Use optional chaining
    if (!ctx) return; // Exit if ctx is null
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };


  const handleAskGPT = async () => {
    try {
      const concatenatedListString = savedRelevantBodyParts.current.map(part => {
        return `{leftWrist: (${part.leftWrist.x.toFixed(3)}, ${part.leftWrist.y.toFixed(3)}), rightWrist: (${part.rightWrist.x.toFixed(3)}, ${part.rightWrist.y.toFixed(3)}), leftElbow: (${part.leftElbow.x.toFixed(3)}, ${part.leftElbow.y.toFixed(3)}), rightElbow: (${part.rightElbow.x.toFixed(3)}, ${part.rightElbow.y.toFixed(3)}), leftShoulder: (${part.leftShoulder.x.toFixed(3)}, ${part.leftShoulder.y.toFixed(3)}), rightShoulder: (${part.rightShoulder.x.toFixed(3)}, ${part.rightShoulder.y.toFixed(3)})}`;
      }).join(', ');
      setListString(concatenatedListString); // Save the string to state
      console.log(concatenatedListString);
      
      // Check if selected exercise is 'overheadPress'
      const prompt = selectedExercise === 'overheadPress' 
        ? "You're a strength training coach. You're giving people advice on their exercise technique. These coordinates represent a skeleton moving through space. The definition of good form is that the x values for the wrist stayed within 10 units from the elbow x value - for both the right and left. Analyze the following coordinates, and tell me if they moved with good form or not. Just respond with a yes or no for each arm - the right and the left. Coordinates - " + concatenatedListString + "Don't give me any math behind your decision. I don't want to see any numbers. Just whether or not my wrists stayed above my elbows as I moved." 
        : (setIsErrorModalOpen(true), "Tell me a fun fact."); // Adjust prompt for other exercises

      const gptResponse = await optimodel(prompt);
      // const gptResponse = await askGPT(prompt)
      console.log(prompt)
      setResponse(gptResponse);
    } catch (error) {
      setResponse('Error occurred while getting the response from GPT-3');
    }
  };

  const [listString, setListString] = useState('');

  const printSavedParts = () => {
    console.log(savedRelevantBodyParts.current);
  };

  const clearList = () => {
    console.log("resetting list")
    savedRelevantBodyParts.current = [];
  };

  const startRecording = () => {
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    savedRelevantBodyParts.current = savedRelevantBodyParts.current.slice(0, -3); // Remove the last three entries
  };

  //  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    //
    setInterval(() => {
      detect(net);
    }, 200);  
  };

  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

  const entryList = entries.map((entry, index) => (
    <p key={index} style={{ color: 'white', fontSize: '14pt' }}>
        detected: {entry}
    </p>
));

useEffect(() => {
  const interval = setInterval(() => {
      setCurrentEntryIndex(prevIndex => (prevIndex + 1) % entries.length); // Loop through entries
  }, 2000); // Change every 2 seconds

  return () => clearInterval(interval); // Cleanup on unmount
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    if (isRecording) {
      const blink = document.getElementById('recording-indicator');
      blink.style.visibility = (blink.style.visibility === 'hidden' ? 'visible' : 'hidden');
    }
  }, 5000); // Blink every 5 seconds

  return () => clearInterval(interval);
}, [isRecording]);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const pose = await net.estimateSinglePose(video);
      if (isRecording) {
        const relevantParts = new RelevantBodyParts(pose);
        savedRelevantBodyParts.current.push(relevantParts); // Save the detected parts
      }

      drawCanvas(pose, video, videoWidth, videoHeight);
    }
  };

  const currentEntry = entries[currentEntryIndex];

  runPosenet();

  const [selectedExercise, setSelectedExercise] = useState('overheadPress'); // State for selected exercise

  return (
    
    <div className="App" style={{ display: 'flex', height: '100vh', backgroundColor: 'black', overflow: 'hidden' }}>
      {isRecording && (
        <div id="recording-indicator" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'red',
          visibility: 'visible'
        }} />
      )}
      <div style={{ flex: '2', position: 'relative', backgroundColor: '#313131', borderRadius: '10px', padding: '10px', margin: '5px' }}>
      <h1 style={{ fontSize: '48px', fontFamily: 'SourceCodePro', color: 'white', textAlign: 'center' }}>
              Coach LLaMa Form Checker🧢🦙
            </h1> 
            <Button onClick={showInfoModal} type="primary" style={{ display: 'block', margin: '20px auto' }} >How does this work? 🤔</Button>
            <div style={{ position: 'relative', zIndex: 1 }}> {/* Bring the button to the front */}
          <Button type="primary" onClick={() => { toggleWebcam(); console.log(isWebcamOn); }}>{isWebcamOn ? 'Turn Webcam Off 📷' : 'Turn Webcam On 📸'}</Button> {/* Toggle button */}
      </div>
      {isRecording && (
        <div id="recording-indicator" style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'red',
          visibility: 'visible',
          marginRight: '10px' // Add space between indicator and button
        }} />
      )}
        {isWebcamOn ? (
          <>
            <Webcam
              ref={webcamRef}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '10px',
              }}
            />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, borderRadius: '10px' }} />
          </>
        ) : (
          <p style={{ 
            fontFamily: 'SourceCodePro', 
            color: 'white', 
            fontSize: '28pt', 
            display: 'flex', 
            // justifyContent: 'center', 
            // alignItems: 'center', 
            // height: '100%' 
          }}>
            Turn Webcam On 📸, and press "Start Recording 🔴" to get Coach LlaMa's feedback on your form!
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}> 
        </div>
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
          <Button type="primary" onClick={startRecording}>Start Recording 🔴</Button>
          <Button type="primary" onClick={stopRecording}>Stop 🛑</Button>
          <Button defaultColor="red"  type="primary" onClick={() => handleAskGPT(selectedExercise, savedRelevantBodyParts, setListString, listString, setResponse)}>Ask coach 🧢🦙</Button>
          {/* <Button type="primary" onClick={printSavedParts}>Print Saved Parts</Button> */}
          
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: '1', margin: '5px' }}>
        <div style={{ flex: '1', backgroundColor: '#313131', borderRadius: '10px', marginBottom: '5px' }}>
        <p style={{ fontSize: '28pt', fontWeight: 'bold', color: 'white', fontFamily: 'SourceCodePro'}}> Selected Exercise </p> 
  <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
    <option value="overheadPress">Overhead Press</option>
    <option value="benchPress">Coming soon! - Bench Press</option>
  </select>
  {isErrorModalOpen && (<Alert message="Sorry! We don't support that yet. Click here to learn about how to add more lifts. Coach LlaMa will tell you a fun fact for your troubles " type="success" closable afterClose={handleErrorCancel} />)}
  {isModalOpen && (
     <Modal title="Welcome to Coach Llama's form checker! How it works 👇" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <p>1. Once you grant access to your webcam, a computer vision model called Posenet.js tracks the movement 👀 of your key body parts. <a href="https://www.tensorflow.org/js" target="_blank" rel="noopener noreferrer">Learn more about TensorFlow.js here</a>.</p>
     <p>2. To start, select the exercise you're performing. When you're ready, press "Start Recording" 🔴 and do 1 rep of your chosen lift 🏋️. Once you're done, press "Stop" 🛑</p>
     <p>3. By pressing "Ask Coach", we use AI 🧠 to analyze your rep, and tell you if it was good form or not.</p>
   </Modal>
        // <Alert message="Alert Message Text" type="success" closable afterClose={onCloseInfoAlert} />
      )}
  {isWebcamOn && ( // Check if the webcam is on
    <div style={{ flex: '1', backgroundColor: '#313131', borderRadius: '10px', padding: '10px' }}>
        <h3 style = {{color: 'white', fontWeight: 'bold', fontFamily: 'SourceCodePro'}}>Detected Entry:</h3>
        
        <p style={{ color: 'white', fontSize: '10pt', fontFamily: 'SourceCodePro' }}>
            {currentEntry}
        </p>
    </div>
)}
        </div>
        <div style={{ flex: '1', backgroundColor: '#313131', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <img src="/llama_base.png" alt="Llama" style={{ height: "200px" }} />
  {response === '' ? (
    <p style={{ fontSize: '18pt', fontWeight: 'bold', color: 'white', fontFamily: 'SourceCodePro', textAlign: 'center' }}> Coach Llama is watching your form</p>
  ) : (
    <div>
      <p style={{ color: 'white', fontFamily: 'SourceCodePro', textAlign: 'center' }}>{response}</p>
    </div>
  )}
          <Button type="primary" onClick={() => { // Wrap in an arrow function
            clearList(); 
            setResponse('');
          }}>Clear</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
