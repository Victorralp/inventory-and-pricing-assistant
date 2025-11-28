import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getMortgageProducts = async () => {
  const querySnapshot = await getDocs(collection(db, 'mortgageProducts'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const calculateMortgage = (principal, interestRate, years) => {
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal,
    interestRate,
    years,
  };
};

export const matchMortgage = async (userProfile) => {
  const { monthlyIncome, creditScore, employmentType, downPayment } = userProfile;

  const allProducts = await getMortgageProducts();

  const scoredProducts = allProducts.map((product) => {
    let score = 0;

    if (monthlyIncome >= product.minIncome) score += 30;
    if (creditScore >= product.minCreditScore) score += 25;
    if (employmentType === product.preferredEmploymentType) score += 20;
    if (downPayment >= product.minDownPayment) score += 25;

    return {
      ...product,
      matchScore: score,
    };
  });

  return scoredProducts
    .filter((p) => p.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore);
};

export const applyForMortgage = async (applicationData) => {
  const docRef = await addDoc(collection(db, 'mortgageApplications'), {
    ...applicationData,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserMortgageApplications = async (userId) => {
  const q = query(
    collection(db, 'mortgageApplications'),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateApplicationStatus = async (applicationId, status) => {
  const docRef = doc(db, 'mortgageApplications', applicationId);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};

export const getNigerianMortgageBanks = () => {
  return [
    {
      name: 'Nigeria Mortgage Refinance Company (NMRC)',
      interestRate: 6.5,
      maxTenure: 20,
      minDownPayment: 10,
    },
    {
      name: 'Federal Mortgage Bank of Nigeria (FMBN)',
      interestRate: 6.0,
      maxTenure: 30,
      minDownPayment: 10,
    },
    {
      name: 'First Bank Mortgage',
      interestRate: 15.0,
      maxTenure: 20,
      minDownPayment: 20,
    },
    {
      name: 'GTBank Mortgage',
      interestRate: 14.5,
      maxTenure: 25,
      minDownPayment: 20,
    },
    {
      name: 'Access Bank Mortgage',
      interestRate: 15.5,
      maxTenure: 20,
      minDownPayment: 20,
    },
    {
      name: 'Zenith Bank Mortgage',
      interestRate: 14.0,
      maxTenure: 25,
      minDownPayment: 15,
    },
    {
      name: 'Stanbic IBTC Mortgage',
      interestRate: 16.0,
      maxTenure: 20,
      minDownPayment: 25,
    },
    {
      name: 'Union Bank Mortgage',
      interestRate: 15.0,
      maxTenure: 20,
      minDownPayment: 20,
    },
  ];
};
