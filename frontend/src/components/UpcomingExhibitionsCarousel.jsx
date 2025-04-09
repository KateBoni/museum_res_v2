import React, { useState, useEffect } from "react";
import ancientImg from "../assets/greek-statue.jpg";
import modernImg from "../assets/modern-art.jpg";
import mythologyImg from "../assets/greek-mythology.jpg";

const exhibitions = [
  {
    title: "Ancient Treasures of Athens",
    date: "April 20 - June 15",
    image: ancientImg, 
  },
  {
    title: "Modern Greek Art & Culture",
    date: "May 1 - July 30",
    image: modernImg,
  },
  {
    title: "Mythology: Gods & Heroes",
    date: "June 10 - August 10",
    image: mythologyImg,
  },
];

const UpcomingExhibitionsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exhibitions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = exhibitions[currentIndex];

  return (
    <div className="carousel-container" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', marginBottom: '5rem' }}>
      <div
        className="carousel-slide"
        style={{
          position: 'relative',
          borderRadius: '40px',
          overflow: 'hidden',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={current.image}
          alt={current.title}
          style={{ width: '100%', height: '400px', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ marginBottom: '0.2rem', fontSize: '1.2rem' }}>{current.title}</h3>
          <p style={{ fontSize: '0.95rem' }}>{current.date}</p>
        </div>
      </div>
    </div>
  );
  
};

export default UpcomingExhibitionsCarousel;
