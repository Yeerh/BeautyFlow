import React from 'react';
import './ServiceCards.css';

const ServiceCards = ({ barber }) => {
  return (
    <div className="service-cards">
      <h1>{barber.name}'s Services</h1>
      <div className="cards-container">
        {barber.services.map((service) => (
          <div className="card" key={service.id}>
            <h2>{service.name}</h2>
            <p>Price: ${service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCards;