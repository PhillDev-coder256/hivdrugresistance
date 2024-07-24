import React, { useState } from 'react';
import './App.css';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { db } from './firebase'; // Assuming firebase is correctly initialized
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"; 

function App() {
  const [patientNames, setPatientNames] = useState('');
  const [admission, setAdmission] = useState('');
  const [fileContents, setFileContents] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [prediction, setPrediction] = useState(null);
  const fileInputRef = React.useRef(null);

  // ... (handlePatientNamesChange, handleAdmissionChange, handleFileChange, readFileContents, handleButtonClick, handleInputChange) 

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
    }
  };

  return (
    <div className="App">
      <div className="q-page-container" style={{ paddingTop: 10 }}>
        <main style={{ minHeight: "none" }} data-v-b04ecca3="">
          <div>
            {/* ... (Your HTML code for input fields, upload button, and results area) ... */}
          </div>
        </main>
      </div>
      <footer className='footer'>
        <p>2024 COPYRIGHT RESERVED</p>
      </footer>
    </div>
  );
}

export default App;
