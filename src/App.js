import { faArrowRight, faBox, faBoxesStacked, faCalendarDays, faCheckDouble, faDisplay, faMinus, faPersonBiking, faPlus, faShop, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import './App.css';
import { db } from './firebase';
import Delivery from './screens/delivery';
import Storage from './screens/storage';

// Function to format date and time
const formatDate = (date) => {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [formData, setFormData] = useState({ name: '', id: '', phone: '', code: '' });
  const [formErrors, setFormErrors] = useState({});
  const [pickFormData, setPickFormData] = useState({ name: '', id: '', phone: '', code: '' });
  const [pickFormErrors, setPickFormErrors] = useState({});
  const [storedParcels, setStoredParcels] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveryItems, setTotalDeliveryItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []); // Run effect only once on component mount

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parcels"));
        const parcelsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStoredParcels(parcelsData);
        console.log("Parcels fetched successfully:", parcelsData);
      } catch (error) {
        console.error("Error fetching parcels:", error);
      }
    };
  
    fetchParcels();
  }, []);

  const formattedDateTime = formatDate(currentDateTime);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.id) errors.id = 'ID No is required';
    if (!formData.phone) errors.phone = 'Phone No is required';
    if (!formData.code) errors.code = 'Code is required';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        await addDoc(collection(db, "parcels"), formData);
        setFormData({ name: '', id: '', phone: '', code: '' });
        alert('PARCEL STORED SUCCESSFULLY!');
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handlePickInputChange = (e) => {
    const { name, value } = e.target;
    setPickFormData({ ...pickFormData, [name]: value });
  };

  const validatePickForm = () => {
    const errors = {};
    if (!pickFormData.name) errors.name = 'Name is required';
    if (!pickFormData.id) errors.id = 'ID No is required';
    if (!pickFormData.phone) errors.phone = 'Phone No is required';
    if (!pickFormData.code) errors.code = 'Code is required';
    return errors;
  };

  const handlePickFromStore = async () => {
    // Validate form data
    const errors = validatePickForm();
    if (Object.keys(errors).length > 0) {
      setPickFormErrors(errors);
      return;
    }
  
    console.log('Stored Parcels:', storedParcels);
    console.log('Entered Code:', pickFormData.code);
  
    // Find the parcel using the provided code
    const foundParcel = storedParcels.find(parcel => parcel.code.trim().toLowerCase() === pickFormData.code.trim().toLowerCase());
  
    if (foundParcel) {
      console.log('Parcel found:', foundParcel);
      alert('PARCEL IS AVAILABLE FOR PICKING');
  
      // Create the delivery detail object
      const deliveryDetail = {
        // ...foundParcel,
        pickerName: pickFormData.name,
        pickerId: pickFormData.id,
        pickerPhone: pickFormData.phone,
        pickCode: pickFormData.code
      };
  
      console.log(deliveryDetail);
  
      try {
        // Add the delivery detail to Firestore
        await addDoc(collection(db, "deliveries"), pickFormData);
        console.log('Delivery added successfully:', pickFormData);
  
        // Update the local deliveries state
        setDeliveries(prevDeliveries => [...prevDeliveries, deliveryDetail]);
        // Clear the pick form data
        setPickFormData({ name: '', id: '', phone: '', code: '' });
      } catch (error) {
        console.error('Error adding delivery:', error);
        // Handle error, show alert or update UI accordingly
      }
    } else {
      console.log('Parcel not found');
      alert('PARCEL IS NOT AVAILABLE');
    }
  };
  

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "deliveries"));
        const deliveriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(deliveriesData);
        setTotalDeliveryItems(deliveriesData.length);
        console.log("Deliveries fetched successfully:", deliveriesData);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };
  
    fetchDeliveries();
  }, []);
  

  const totalItems = storedParcels.length; // Calculate total items

  // Add an event handler to update the search query
  const handleSearchInputChange = (e) => {
  setSearchQuery(e.target.value);
};


const handleSearch = () => {
  // Check if searchQuery is defined and not empty
  if (!searchQuery || searchQuery.trim() === '') {
    alert('Please enter a valid parcel Code.');
    return;
  }
  
  const searchQueryLower = searchQuery.trim().toLowerCase();
  
  // Ensure storedParcels and deliveries are not undefined
  if (!storedParcels || !deliveries) {
    console.error('Stored parcels or deliveries are undefined');
    return;
  }
  
  // Find the parcel using the provided code
  let foundParcel = storedParcels.find(parcel => parcel.code === searchQueryLower);
  let foundDelivery = deliveries.find(delivery => delivery.code === searchQueryLower);
  
  const results = [];
  if (foundParcel) {
    results.push({ ...foundParcel, source: 'storage' });
  }
  if (foundDelivery) {
    results.push({ ...foundDelivery, source: 'delivery' });
  }
  
  console.log("Search Results: ", results);
  setSearchResults(results);
  
  if (results.length === 0) {
    alert('Code not found in either storage or delivery.');
  }
};

  
  
  


  return (
    <div className="App">
      {/* navigation section container */}
      <div className='Navigation'>
        <div className='nav-items-box'>

          {/* profile section */}
          <div className='profile-section'>
            <div className='icon-cont'><FontAwesomeIcon icon={faUser} size="1x" className='profile-icon'/></div>
            <div className='profile-tittle'>
              <span className='adm-tittle'>Vic Cheru</span>
              <span>Panel Admin</span>
            </div>
          </div>

          <div className='dashboard-box'>

          <div onClick={() => setCurrentScreen('home')} className='dashboard-items'>
              <span><FontAwesomeIcon icon={faDisplay} size="1x" className='dash-icons'/></span>
              <span>Dashboard</span>
            </div>

            <div onClick={() => setCurrentScreen('storage')} className='dashboard-items'>
              <span><FontAwesomeIcon icon={faBox} size="1x" className='dash-icons'/></span>
              <span>Storage</span>
            </div>


            <div onClick={() => setCurrentScreen('delivery')} className='dashboard-items'>
              <span><FontAwesomeIcon icon={faPersonBiking} size="1x" className='dash-icons'/></span>
              <span>Delivery</span>
            </div>

          </div>

        </div>
        <div className='logout-box'>
        <span><FontAwesomeIcon icon={faArrowRight } size="1x" /> </span>
          <span> Logout</span>
        </div>
      </div>

      {/* home page section */}
      <div className='HomePage'>
        <div className='header'>
          <div className='com-logo'></div>
          {/* <span className='com-name-logo'>THE FREELANCER</span> */}
        </div>

        <div className='act-date'>
          <span>Activities</span>
          <span> <FontAwesomeIcon icon={faCalendarDays} size="1x" /> {formattedDateTime} </span>
        </div>
        

        {/* HomePage container/ main page */}
        <div>
      <div className={`home-cont-container ${currentScreen !== 'home' ? 'hidden' : ''}`}>
        <div className='home-page-container'>
          <div className='home-activities'>
            <div className='home-semi-activity'>
              <div className='in-store'>
                <div className='store-container'>
                  <div className='store-icon'>
                    <FontAwesomeIcon icon={faShop} size="2x" />
                  </div>
                  <div className='store-content'>
                    <span>Store</span>
                    <span className='pkg-amt'>{totalItems}</span>
                  </div>
                </div>
              </div>
              <div className='pending'>
                <div className='pending-container'>
                  <div className='pending-icon'>
                    <FontAwesomeIcon icon={faBoxesStacked} size="2x" />
                  </div>
                  <div className='store-content'>
                    <span>In-Queue</span>
                    <span className='pkg-amt'>{deliveries.length}</span>
                  </div>
                </div>
              </div>
              <div className='delivered'>
                <div className='delivered-container'>
                  <div className='delivered-icon'>
                    <FontAwesomeIcon icon={faCheckDouble} size="2x" />
                  </div>
                  <div className='store-content'>
                    <span>Delivered</span>
                    <span className='pkg-amt'>40</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='act-chart'>

              <div className='act-chart-cont'>
                <span className='act-chart-tittle'>Parcel's Check-In Section</span>
                <span className='act-add-item'>Add Item to Store <FontAwesomeIcon className='add-icon' icon={faPlus} size="1x" /></span>
              </div>

              <div className='parcel-check-sec'>
              <div className='add-item-detail'>
                Please Enter Parcels's owner Details. <br />
        <div className='credentials-cont'>
          <input
            className='add-name-store'
            type='text'
            name='name'
            placeholder='Name'
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {formErrors.name && <span className="error">{formErrors.name}</span>}
          
          <input
            className='add-id-store'
            type='Number'
            name='id'
            placeholder='ID No'
            value={formData.id}
            onChange={handleInputChange}
            required
          />
          {formErrors.id && <span className="error">{formErrors.id}</span>}
          
          <input
            className='add-phone-store'
            type='Number'
            name='phone'
            placeholder='Phone No'
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          {formErrors.phone && <span className="error">{formErrors.phone}</span>}
          
          <input
            className='add-code-store'
            type='text'
            name='code'
            placeholder='Code'
            value={formData.code}
            onChange={handleInputChange}
            required
          />
          {formErrors.code && <span className="error">{formErrors.code}</span>}
        </div>
        <div className='action-box'>
          <span className='action-add-store' onClick={handleSubmit}>Add to Store</span>
        </div>
      </div>

            {/* pick item from store */}
              <div className='act-chart-cont'>
                <span className='act-chart-tittle-out'>Parcel's Check-Out Section</span>
                <span className='act-add-item'>Pick Item from Store <FontAwesomeIcon className='add-icon' icon={faMinus} size="1x" /></span>
              </div>

              <div className='pick-item-detail'>
              Please Enter Parcels's picker Details. <br />
              <div className='credentials-cont'>
          <input
            className='pick-name-store'
            type='text'
            name='name'
            placeholder='Name'
            value={pickFormData.name}
            onChange={handlePickInputChange}
            required
          />
          {pickFormErrors.name && <span className="error">{pickFormErrors.name}</span>}
          
          <input
            className='pick-id-store'
            type='Number'
            name='id'
            placeholder='ID No'
            value={pickFormData.id}
            onChange={handlePickInputChange}
            required
          />
          {pickFormErrors.id && <span className="error">{pickFormErrors.id}</span>}
          
          <input
            className='pick-phone-store'
            type='Number'
            name='phone'
            placeholder='Phone No'
            value={pickFormData.phone}
            onChange={handlePickInputChange}
            required
          />
          {pickFormErrors.phone && <span className="error">{pickFormErrors.phone}</span>}
          
          <input
            className='pick-code-store'
            type='text'
            name='code'
            placeholder='Code'
            value={pickFormData.code}
            onChange={handlePickInputChange}
            required
          />
          {pickFormErrors.code && <span className="error">{pickFormErrors.code}</span>}
        </div>
        {/* {pickError && <span className="error">{pickError}</span>} */}
        <div className='action-box'>
          <span className='action-pick-store' onClick={handlePickFromStore}>Pick from Store</span>
        </div>
              </div>
              </div>

            </div>
          </div>
        </div>
        <div className='quick-access'>
          <div className='quick-access-content'>
            <span className='quick-tittle'>Quick Access</span>
            <div className='search-box'>
            <input 
              type='text' 
              placeholder='Search Code' 
              className='search-input'
              value={searchQuery}
              onChange={handleSearchInputChange} // Use the event handler to update searchQuery
            />
              <span className='searchBtn' onClick={handleSearch}>SEARCH</span> {/* Add onClick event to trigger handleSearch */}
            </div>

            <div className='courier-cont'>
              <div className='courier-header'>
                <span>ID</span>
                <span>Name</span>
                <span>Phone Number</span>
                <span>Code</span>
                <span>Source</span>
                
              </div>
              <div className='search-output'>
                    {searchResults.length === 0 ? (
                      <div>No results found</div>
                    ) : (
                      searchResults.map(result => (
                        <div key={result.id} className='result-output'>
                          <span>{result.id}</span>
                          <span>{result.name}</span> {/* Added name field here */}
                          <span>{result.phone}</span>
                          <span>{result.code}</span>
                          <span>{result.source}</span>
                        </div>
                      ))
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="content">
        {currentScreen === 'storage' && <Storage  />}
        {currentScreen === 'delivery' && <Delivery  />}
        {/* {currentScreen === 'storage' && <Storage />} */}
      </div>
    </div>

        
        </div>

      </div>

  );
}

export default App;
