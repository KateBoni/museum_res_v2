import React, { useEffect, useState } from 'react';
import api from "../api";  
import '../styles/MuseumList.css';
import { Link, useNavigate } from 'react-router-dom';
import { getMuseums } from '../MuseumServices';


const MuseumList = () => {
    const [ museums, setMuseums ] = useState([]);
    const [ filteredMuseums, setFilteredMuseums] = useState([]); 
    const [ museumTypes, setMuseumTypes] = useState([]);
    const [ museumLocations, setMuseumLocations] = useState([]);
    const [selectedMuseumType, setSelectedMuseumType] = useState(""); 
    const [selectedMuseumLocation, setSelectedMuseumLocation] = useState(""); 
    const [search, setSearch] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchMuseums();
        fetchMuseumTypes();
        fetchMuseumLocations();
    }, []);

    const fetchMuseums = async () => {
        try {
            const data = await getMuseums();
            console.log('Fetched Museums:', data);
            setMuseums(data);
            setFilteredMuseums(data);
        } catch (error) {
            console.error('Error fetching museums:', error);
        }
    };

    const fetchMuseumTypes = async () => {
        try {
            const response = await api.get('api/museums/'); 
            const museums = response.data;
            const types = [...new Set(museums.map(museum => museum.type))];
    
            setMuseumTypes(types);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    const fetchMuseumLocations = async () => {
        try {
            const response = await api.get('api/museums/'); 
            const museums = response.data;
            const locations = [...new Set(museums.map(museum => museum.location))];
    
            setMuseumLocations(locations);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const filterMuseums = () => {
        let updatedMuseums = museums;

        // Filter by Type
        if (selectedMuseumType) {
            updatedMuseums = updatedMuseums.filter(museum => museum.type === selectedMuseumType);
        }
        // Filter by Location
        if (selectedMuseumLocation) {
            updatedMuseums = updatedMuseums.filter(museum => museum.location === selectedMuseumLocation);
        }

        // Filter by Search
        if (search) {
            updatedMuseums = updatedMuseums.filter(
                museum =>
                    museum.name.toLowerCase().includes(search.toLowerCase()) 
        
            );
        }

        setFilteredMuseums(updatedMuseums);
    };

    useEffect(() => {
        filterMuseums();
    }, [selectedMuseumType, selectedMuseumLocation, search]);

    return (
        <div className="main-content">
            <div className="museum-content">
                <h1>Check our Museums</h1>

                <div className="museum-search">
                    <input type="text" placeholder="Search for museums..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}/>
                </div>

                <div className='museum-header'>
                    <div className="filter-group">
                        <label>Museum Types:</label>
                        <select value={selectedMuseumType} onChange={(e) => setSelectedMuseumType(e.target.value)}>
                            <option value="">All Types</option>
                            {museumTypes.map((types) => (
                                <option key={types} value={types}>{types}</option>
                            ))}
                        </select>
                        <label>Location</label>
                        <select value={selectedMuseumLocation} onChange={(e) => setSelectedMuseumLocation(e.target.value)}>
                            <option value="">All Locations</option>
                            {museumLocations.map((locations) => (
                                <option key={locations} value={locations}>{locations}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <ul className="museum-list">
                    {filteredMuseums.map((museum) => (
                        <li key={museum.name} className="museum-item" onClick={() => navigate(`/reserve/${museum.name}`, { state: { museumId: museum.id, 
                            museumName: museum.name,
                            museumPhoto: museum.photo,
                            museumDescription: museum.description,
                            museumLocation: museum.location,
                            museumOpeningHours: museum.opening_hours } })}>
                            <img src={museum.photo || 'https://via.placeholder.com/120x180'} alt={museum.name} />
                            <div className="museum-details">
                                <span className="museum-name">{museum.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>


    );
};

export default MuseumList;
