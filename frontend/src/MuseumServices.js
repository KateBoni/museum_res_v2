import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', 
});

// Fetch all museums
export const getMuseums = async () => {
    const response = await API.get('museums/');
    const museums = response.data.map((museum) => ({
        ...museum,
        name: museum.name, 
    }));
    return museums;
};

export const getUserReservations = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    const userId = parseInt(localStorage.getItem("USER_ID"));
  
    if (!token || !userId) return [];
  
    const response = await API.get("reservations/", {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    const allReservations = response.data;
    const filtered = allReservations.filter((res) => res.user === userId);
    return filtered;
  };
  