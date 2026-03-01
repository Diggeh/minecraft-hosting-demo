import React from 'react';
import "./Navbar.css";
import logo from '../assets/logo.png';

export default function Navbar() {
    return (
        <>
            <header className="main-header">
                <div className="header-container">
                    <div className="logo">
                        <img src={logo} alt="BlockBayan Logo" />
                        <h2>BlockBayan</h2>
                    </div>
                    <nav className="navigation">
                        <a href="/">Home</a>
                        <a href="/plans">Plans</a>
                        <a href="/features">Features</a>
                        <a href="/login">Login</a>
                        <a href="/contactus">Contact us</a>
                    </nav>
                </div>
            </header>
        </>
    )
};
