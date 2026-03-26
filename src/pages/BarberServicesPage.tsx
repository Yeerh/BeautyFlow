import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBarberServices } from '../lib/api';
import ServiceCards from '../components/ServiceCards';

const BarberServicesPage = () => {
  const { linkId } = useParams();
  const [barber, setBarber] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBarberServices = async () => {
      try {
        const data = await fetchBarberServices(linkId);
        setBarber(data);
      } catch (err) {
        setError('Failed to load services.');
      }
    };

    getBarberServices();
  }, [linkId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!barber) {
    return <div>Loading...</div>;
  }

  return <ServiceCards barber={barber} />;
};

export default BarberServicesPage;