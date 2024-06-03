import React, { useEffect, useState } from 'react';
import '../App.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Delivery = ({ totalDeliveryItems }) => {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "deliveries"));
        const deliveriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(deliveriesData);
        console.log("Deliveries fetched successfully:", deliveriesData);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <div className='Delivery'>
      <div className='delivery-container'>
        <span className='delivery-tittle'>THE FREELANCER PARCEL DELIVERY</span>
      </div>
      <div className='delivered-parcels'>
        <div className='total-items'>
          <span className='total-dl-items'>Total Items in Delivery: {deliveries.length}</span>
        </div>
        {deliveries.map((delivery) => (
          <div key={delivery.id} className='parcel'>
            <div className='parcel-details'>
            <p>Picker's Name: {delivery.name}</p>
            <p>Picker's ID No: {delivery.id}</p>
            <p>Picker's Phone No: {delivery.phone}</p>
            <p>Picker's Code: {delivery.code}</p>
            </div>
            <div className='check-pending'>
              <span className='pending-signal'>Pending</span>
              <span className='markDeliverBtn'>Mark as Delivered</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Delivery;
