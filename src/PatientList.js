
// PatientList.js
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, "patients"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const patientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsList);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("There was an error fetching patient data. Please try again later.");
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="PatientList">
      <h2>Recent Patients</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Admission Code</th>
            <th>Sequence</th>
            <th>Resistance</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.patientNames}</td>
              <td>{patient.admission}</td>
              <td>{patient.sequence}</td>
              <td>{patient.resistance === 1 ? "Resistant" : "Not Resistant"}</td>
              <td>{patient.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientList;
