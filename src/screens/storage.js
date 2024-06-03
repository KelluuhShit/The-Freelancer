import React, { useEffect, useState } from 'react';
import '../App.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Storage = ({ totalItems }) => {
  const [parcels, setParcels] = useState([]);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parcels"));
        const parcelsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setParcels(parcelsData);
        console.log("Parcels fetched successfully:", parcelsData);
      } catch (error) {
        console.error("Error fetching parcels:", error);
      }
    };

    fetchParcels();
  }, []);

  return (
    <div className='Storage'>
        <span className='storage-tittle'>THE FREELANCER PARCEL STORAGE</span>
      <div className='storage-container'>
      <div className='total-items'>
          <span>Total Items in Store: {parcels.length}</span>
        </div>
        
        <div className='stored-parcels'>
          {parcels.map((parcel) => (
            <div key={parcel.id} className='parcel-details'>
              <p>Name: {parcel.name}</p>
              <p>ID No: {parcel.id}</p>
              <p>Phone No: {parcel.phone}</p>
              <p>Code: {parcel.code}</p>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Storage;
