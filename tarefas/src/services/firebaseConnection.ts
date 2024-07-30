import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPIlCcpUHu6m8J3xxfIFntktrsNqLrrBY",
  authDomain: "tarefasplus-63dbd.firebaseapp.com",
  projectId: "tarefasplus-63dbd",
  storageBucket: "tarefasplus-63dbd.appspot.com",
  messagingSenderId: "777785558288",
  appId: "1:777785558288:web:c2cca0d544003825809195"
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export { db }