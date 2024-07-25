import React, { useState } from 'react';
import './App.css';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
function App() {
const [patientNames, setPatientNames] = useState('');
const [admission, setAdmission] = useState('');
const [fileContents, setFileContents] = useState('');
const [inputValue, setInputValue] = useState('');
const [prediction, setPrediction] = useState(null);
const fileInputRef = React.useRef(null);
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
// Check if the inputValue matches any of the non-resistant sequences
const nonResistantSequences = [
"PQITLWQRPLVTIKIGGQLKEALLDTGADDTVLEEMNLPGRWKPKMIGGIGGFIKVRQYDQILIEICGHKAIGTVLVGPTPVNIIGRNLLTQIGCTLNF",
// Add more non-resistant sequences as needed
];
if (nonResistantSequences.includes(inputValue)) {
setPrediction({
resistance: 0, // Set resistance to 0 for non-resistant sequences
patientNames,
admission,
date: new Date().toLocaleString(),
});
} else {
// If not a non-resistant sequence, proceed with the prediction request
const requestData = {
sequence: inputValue
};
try {
  const res = await axios.post('https://mallan.net/hiv_prediction', requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const predictionResult = res.data;
  const currentDate = new Date().toLocaleString(); // Get the current date and time

  // Save patient data, prediction result, and date in Firestore
  const docRef = await addDoc(collection(db, "patients"), {
    patientNames,
    admission,
    sequence: inputValue,
    resistance: predictionResult.resistance,
    date: currentDate // Store the current date
  });

  // Fetch the saved document to verify
  const q = query(collection(db, "patients"), where("__name__", "==", docRef.id));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data()}`);
  });

  setPrediction({ ...predictionResult, patientNames, admission, date: currentDate });
} catch (error) {
  console.error("Error while predicting:", error);
  alert("There was an error while predicting. Ensure the sequence is correct");
}
}
};
return (

<div className="q-page-container" style={{ paddingTop: 10 }}>
<main style={{ minHeight: "none" }} data-v-b04ecca3="">


HIV-ResistNet
Accurately predict HIV drug resistance profiles online using Artificial Intelligence.





INPUT PATIENTS' DATA
<div style={{ display: 'flex' }}>
<input
type="text"
placeholder="Patient Names"
className="inputothers"
value={patientNames}
onChange={handlePatientNamesChange}
style={{ marginRight: '10px' }}
/>




UPLOAD SEQUENCE

<input
type="file"
accept=".txt"
onChange={handleFileChange}
ref={fileInputRef}
style={{ display: 'none' }}
/>

-------------- OR ------------




PREDICT RESISTANCE



RESULTS
{prediction && (

Patient Information:
Name: {prediction.patientNames}

Admission: {prediction.admission}

Prediction Result:
Resistance: {prediction.resistance === 1 ? "THE SEQUENCE IS RESISTANT" : "THE SEQUENCE IS NOT RESISTANT"}

Date:
{prediction.date}


)}








TRAINED AND DEVELOPED BY ALLEN AND ESTHER



);
}
export default App;
