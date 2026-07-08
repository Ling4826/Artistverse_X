// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC-8jfX8YN0RXpW-90vomKRQYPqkgM_IPI',
  authDomain: 'artistverse-frontend-2fce5.firebaseapp.com',
  projectId: 'artistverse-frontend-2fce5',
  storageBucket: 'artistverse-frontend-2fce5.appspot.com',
  messagingSenderId: '427202129227',
  appId: '1:427202129227:web:583f0d6bb4c2a67d610cce'
}

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage };