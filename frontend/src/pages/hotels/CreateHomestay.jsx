import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomestayWizard } from '../../components/homestay/HomestayWizard';

export const CreateHomestay = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/hotels/homestays');
  };

  const handleSave = async (formData) => {
    try {
      const response = await fetch('/api/homestays', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
          // Note: Don't set Content-Type header for FormData, let browser set it
        },
        body: formData // FormData object instead of JSON.stringify
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Homestay created successfully:', result);
        navigate('/hotels/homestays');
      } else {
        const error = await response.json();
        console.error('Error creating homestay:', error);
        alert('Error creating homestay: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving homestay:', error);
      alert('Error saving homestay: ' + error.message);
    }
  };

  return (
    <HomestayWizard
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};