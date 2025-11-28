import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const sendContactEmail = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/email/contact`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

export const sendMortgageApplicationEmail = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/email/mortgage-application`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending mortgage application email:', error);
    throw error;
  }
};

export const sendPropertyInquiryEmail = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/email/property-inquiry`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending property inquiry email:', error);
    throw error;
  }
};

export const subscribeToNewsletter = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/email/newsletter`, { email });
    return response.data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};
