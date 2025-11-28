import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const createProperty = async (propertyData) => {
  const docRef = await addDoc(collection(db, 'properties'), {
    ...propertyData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getProperties = async (filters = {}) => {
  let q = collection(db, 'properties');
  const constraints = [];

  if (filters.location) {
    constraints.push(where('location', '>=', filters.location));
    constraints.push(where('location', '<=', filters.location + '\uf8ff'));
  }

  if (filters.propertyType) {
    constraints.push(where('type', '==', filters.propertyType));
  }

  if (filters.priceMin && filters.priceMax) {
    constraints.push(where('price', '>=', filters.priceMin));
    constraints.push(where('price', '<=', filters.priceMax));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getPropertyById = async (propertyId) => {
  const docRef = doc(db, 'properties', propertyId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }
  return null;
};

export const updateProperty = async (propertyId, updates) => {
  const docRef = doc(db, 'properties', propertyId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProperty = async (propertyId) => {
  await deleteDoc(doc(db, 'properties', propertyId));
};

export const getFeaturedProperties = async (limitCount = 6) => {
  const q = query(
    collection(db, 'properties'),
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const calculateAIRentPrediction = (property) => {
  const basePrice = property.price || 0;
  const { bedrooms = 1, location = '', type = '', size = 0 } = property;

  let multiplier = 1.0;

  const premiumLocations = ['Ikoyi', 'Victoria Island', 'Lekki', 'Banana Island'];
  if (premiumLocations.some(loc => location.includes(loc))) {
    multiplier += 0.3;
  }

  const bedroomMultiplier = {
    1: 0.8,
    2: 1.0,
    3: 1.2,
    4: 1.4,
    5: 1.6,
  };
  multiplier *= bedroomMultiplier[bedrooms] || 1.0;

  if (type === 'apartment') multiplier *= 0.9;
  if (type === 'detached') multiplier *= 1.3;
  if (type === 'semi-detached') multiplier *= 1.1;

  const fairRent = (basePrice * 0.06 * multiplier) / 12;

  return {
    monthlyRent: Math.round(fairRent),
    yearlyRent: Math.round(fairRent * 12),
    confidence: 0.85,
    factors: {
      location: premiumLocations.some(loc => location.includes(loc)) ? 'Premium' : 'Standard',
      bedrooms,
      propertyType: type,
    },
  };
};
