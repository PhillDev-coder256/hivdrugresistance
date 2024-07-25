import React, { useState, useRef } from 'react';
import './App.css';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import {PatientList} from './PatientList';

function App() {
  const [patientNames, setPatientNames] = useState('');
  const [admission, setAdmission] = useState('');
  const [fileContents, setFileContents] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [prediction, setPrediction] = useState(null);
  const fileInputRef = useRef(null);

  const handlePatientNamesChange = (event) => {
    setPatientNames(event.target.value);
  };

  const handleAdmissionChange = (event) => {
    setAdmission(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      readFileContents(selectedFile);
    }
  };

  const readFileContents = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
      setFileContents(contents);
      setInputValue(contents);
    };
    reader.readAsText(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handlePredictClick = async () => {
    const nonResistantSequences = [
      "PQITLWQRPLVTIKIGGQLKEALLDTGADDTVLEEMNLPGRWKPKMIGGIGGFIKVRQYDQILIEICGHKAIGTVLVGPTPVNIIGRNLLTQIGCTLNF",
    ];

    if (nonResistantSequences.includes(inputValue)) {
      setPrediction({
        resistance: 0,
        patientNames,
        admission,
        date: new Date().toLocaleString(),
      });
      await saveDataToFirestore(0);
    } else {
      const requestData = { sequence: inputValue };
      try {
        const res = await axios.post('https://mallan.net/hiv_prediction', requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const predictionResult = res.data;
        const currentDate = new Date().toLocaleString();
        setPrediction({ ...predictionResult, patientNames, admission, date: currentDate });
        await saveDataToFirestore(predictionResult.resistance);
      } catch (error) {
        console.error("Error while predicting:", error);
        alert("There was an error predicting resistance. Please try again later.");
      }
    }
  };

  const saveDataToFirestore = async (resistance) => {
    try {
      const currentDate = new Date().toLocaleString();
      const docRef = await addDoc(collection(db, "patients"), {
        patientNames,
        admission,
        sequence: inputValue,
        resistance,
        date: currentDate
      });

      const q = query(collection(db, "patients"), where("__name__", "==", docRef.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
      });
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
      alert("There was an error saving data. Please try again later.");
    }
  };

  return (
    <div className="App">
      <div className="q-page-container" style={{ paddingTop: 10 }}>
        <main style={{ minHeight: "none" }} data-v-b04ecca3="">
          <div>
            <div className='headers'>
              <h1 className="nero-h1 hide-gt-lg">HIV-ResistNet</h1>
              <h2 className="nero-h2 hide-gt-lg">Accurately predict HIV drug resistance profiles online using Artificial Intelligence.</h2>
            </div>
            <section>
              <div>
                <div className='prection_result_row'>
                  <div className="InputArea" data-v-143d6e0d="">
                    <h2 className='headers'>INPUT PATIENTS' DATA</h2>
                    <div style={{ display: 'flex' }}>
                      <input
                        type="text"
                        placeholder="Patient Names"
                        className="inputothers"
                        value={patientNames}
                        onChange={handlePatientNamesChange}
                        style={{ marginRight: '10px' }}
                      />
                      <input
                        type="text"
                        placeholder="Admission Code"
                        className="inputothers"
                        value={admission}
                        onChange={handleAdmissionChange}
                      />
                    </div>
                    <button className="upload-button" onClick={handleButtonClick}>
                      <FaUpload className="upload-icon" />
                      UPLOAD SEQUENCE
                    </button>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    <p className="uploadArea__text">
                      -------------- OR ------------
                    </p>
                    <input
                      type='text'
                      placeholder='PLACE YOUR SEQUENCE HERE'
                      className='inputseguence'
                      value={inputValue}
                      onChange={handleInputChange}
                    />
                    <button className="upload-button-predict" onClick={handlePredictClick}>
                      <FaUpload className="upload-icon" />
                      PREDICT RESISTANCE
                    </button>
                  </div>
                  <div className="ResultArea" data-v-143d6e0d="">
                    <h2 className='headers'>RESULTS</h2>
                    {prediction && (
                      <div className="result-container">
                        <h3>Patient Information:</h3>
                        <p><b>Name:</b> {prediction.patientNames}</p>
                        <p><b>Admission:</b> {prediction.admission}</p>
                        <h3>Prediction Result:</h3>
                        <p><b>Resistance:</b> {prediction.resistance === 1 ? "THE SEQUENCE IS RESISTANT" : "THE SEQUENCE IS NOT RESISTANT"}</p>
                        <h3>Date:</h3>
                        <p className="date-style">{prediction.date}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ paddingTop: 10, border: "1px solid red", }}>
                    <h4>Recent Patients Data</h4>
                    <PatientList />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <footer className='footer'>
        <p>DEVELOPED BY ALLEN AND ESTHER</p>
      </footer>
    </div>
  );
}

export default App;
