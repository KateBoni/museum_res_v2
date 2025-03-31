import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {

    return (
        <div>

            <div className="hero-section">
                <div className="overlay"></div>  
                <div className="hero-text">
                    <h1>Discover the Rich History of Greek Museums</h1>
                    <p>Explore ancient artifacts, timeless art, and captivating exhibitions.</p>
                    <Link to="/browse-museums" className="hero-btn">Book Your Visit</Link>
                </div>
            </div>

            <div className="home-container">
                <div className="featured-museums">
                    <h2>Upcoming Exhibitions</h2>
                    <p>Stay updated on the latest events and exhibitions in Greece’s finest museums.</p>
                </div>

                <div className="about-forum-container">
                    <div className="about-content">
                        <h2>About Us</h2>
                        <p>
                            Our mission is to connect you with the rich cultural heritage of Greece. 
                            From historical landmarks to modern art galleries, we make it easy to explore and 
                            reserve your museum visits.
                        </p>
                    </div>

                    <div className="forum-invite">
                        <h2>Join Our Community!</h2>
                        <p>
                            Share your experiences, discuss historical insights, and connect with fellow 
                            museum lovers in our online forum.
                        </p>
                        <a href="/forum" className="forum-btn">Visit the Forum</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
