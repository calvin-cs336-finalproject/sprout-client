
// src/services/firestoreService.js
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import dotenv from 'dotenv';
dotenv.config();

// Add a document to a collection
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Get all documents from a collection
// export const getAllDocuments = async (collectionName) => {
//   try {
//     const querySnapshot = await getDocs(collection(db, collectionName));
//     return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   } catch (e) {
//     console.error("Error fetching documents: ", e);
//     throw e;
//   }
// };
export const getAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Log each document to the console
    documents.forEach((doc) => console.log(doc));

    return documents; // Still returns the data if needed
  } catch (e) {
    console.error("Error fetching documents: ", e);
    throw e;
  }
};

// Get a single document by ID
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error fetching document: ", e);
    throw e;
  }
};

// Update a document
export const updateDocument = async (collectionName, docId, updatedData) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updatedData);
    console.log("Document updated successfully");
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log("Document deleted successfully");
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

getAllDocuments('users');

// const fetchData = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'users'));
//     querySnapshot.forEach((doc) => {
//       console.log(doc.id, '=>', doc.data());
//     });
//   } catch (error) {
//     console.error("Error fetching data: ", error);
//   }
// };

// // Call the function to fetch and print data
// fetchData();