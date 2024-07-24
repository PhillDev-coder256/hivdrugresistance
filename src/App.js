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
Use code with caution.
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
export default App; why is that not submitting the data please

Model
12.7s
Let's debug why your React code isn't submitting data to Firestore. Here's a breakdown of the potential issues and how to fix them:
1. Firestore Setup and Permissions:
Initialization: Ensure you've properly initialized Firebase in your React application. The db variable should be correctly referencing your Firestore database.
Security Rules: Verify that your Firestore security rules allow the write operation you're trying to perform. Double-check that the rules you've deployed grant access to your React app.
2. Data Handling and Validation:
Input Values: Make sure that the patientNames, admission, inputValue are correctly capturing the data from your input fields.
Axios Request: The axios.post call should be properly configured to send the data to your prediction endpoint (https://mallan.net/hiv_prediction).
Response Handling: Make sure your code handles the response from the server correctly. Check if the response has a resistance property.
Firestore Document: When creating the document, make sure you're providing the correct data. Double-check that the resistance, date, and other fields are accurate.
3. Error Handling:
Logging: Use console.error to log any errors that might occur during the process (axios request, Firestore interaction, etc.).
Alert: Consider adding a try...catch block around the handlePredictClick function to handle potential errors and alert the user.
Refined Code with Debugging (Based on the Snippet Provided):
import React, { useState } from 'react';
import './App.css';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { db } from './firebase'; // Assuming firebase is correctly initialized
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"; 

function App() {
  // ... (rest of your component code)

  const handlePredictClick = async () => {
    // ... (non-resistant sequence check) 

    // If not non-resistant sequence, proceed with prediction
    const requestData = {
      sequence: inputValue
    };

    try {
      const res = await axios.post('https://mallan.net/hiv_prediction', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.status !== 200) {
        console.error("Prediction API request failed:", res.statusText);
        alert("There was an error while predicting. Please try again later.");
        return; // Stop execution if the API request fails
      }

      const predictionResult = res.data;
      const currentDate = new Date().toLocaleString(); 

      // Save patient data, prediction result, and date in Firestore
      try {
        const docRef = await addDoc(collection(db, "patients"), {
          patientNames,
          admission,
          sequence: inputValue,
          resistance: predictionResult.resistance,
          date: currentDate 
        });

        // Fetch the saved document to verify 
        const q = query(collection(db, "patients"), where("__name__", "==", docRef.id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data()}`); 
        });

        setPrediction({ ...predictionResult, patientNames, admission, date: currentDate });
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
        alert("There was an error saving data. Please check your Firebase setup.");
      }
    } catch (error) {
      console.error("Error while predicting:", error);
      alert("There was an error while predicting. Ensure the sequence is correct");
    }
  };

  // ... (rest of your component code)
}

export default App;
