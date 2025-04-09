import React, { useState } from 'react';
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/NavBar";
import './styles/variables.css';
import MuseumList from "./pages/MuseumList";
import Login from "./pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import Register from "./pages/Register"
import { AuthProvider } from "./components/AuthContext";
import ReservationForm from "./pages/ReservationForm";
import Logout from "./pages/Logout";
import Reservations from "./pages/Reservations";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <>
     
     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
            <Navbar />
              <Routes>
                <Route path="/" element={ <Home /> } />
                <Route path="/browse-museums" element={<MuseumList />} />
                <Route path="/reserve/:museumName" element={<ReservationForm />} />
                <Route path="/my-reservations" element={<Reservations />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<RegisterAndLogout />} />
              </Routes>
              
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
    </>
  )
}

export default App
