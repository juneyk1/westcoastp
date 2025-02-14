import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './About.css'
import Header from './header.jsx'

const About = () => {
    // mock data
    const name = "West Coast Physicians Alliance"
    const short = "Excepteur sint occaecat cupidatat non, \
    sunt in culpa qui officia deserunt mollit anim id est laborum"
    const blurb = "We believe that Lorem ipsum dolor sit \
    amet, consectetur adipiscing elit,\
     sed do eiusmod tempor incididunt ut labore et\
      dolore magna aliqua. Ut enim ad minim veniam, \
     quis nostrud exercitation ullamco laboris nisi\
      ut aliquip ex ea commodo consequat. Duis aute \
     irure dolor in reprehenderit in voluptate velit\
      esse cillum dolore eu fugiat nulla pariatur."


    return (
        <div className="about-page">
            <Header/>
            <div className="about-info">
                <div className="our-name"> {name} </div>
                <div className="about-us">
                <p style={{fontSize: '35px', paddingBottom: '20px'}}> About Us</p>
                <p style={{fontSize: '18px', paddingBottom: '20px'}}> {short}</p>
                <p style={{fontSize: '22px'}}> {blurb}</p>
                </div>
            </div>
        </div>
    );
}


export default About;