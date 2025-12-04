// src/services/firebaseService.ts
import {
    doc,
    setDoc,
    addDoc,
    collection,
    serverTimestamp,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "../lib/firebase";
  import { v4 as uuidv4 } from "uuid";
  
  export async function upsertLead(
    leadId: string | null,
    data: { name?: string; phone?: string; status?: string; tags?: string[] }
  ) {
    const id = leadId || uuidv4();
    const ref = doc(db, "leads", id);
  
    await setDoc(
      ref,
      {
        ...data,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  
    return id;
  }
  
  export async function saveMessage(
    leadId: string,
    role: "client" | "closer" | "system",
    text: string
  ) {
    const leadRef = doc(db, "leads", leadId);
    const msgsCol = collection(leadRef, "messages");
  
    await addDoc(msgsCol, {
      role,
      text,
      timestamp: serverTimestamp(),
    });
  
    await updateDoc(leadRef, {
      lastCall: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }
  
  export async function saveReferidos(
    leadId: string,
    referidos: { name?: string; phone?: string }[]
  ) {
    if (!referidos || !referidos.length) return;
  
    const leadRef = doc(db, "leads", leadId);
    const refsCol = collection(leadRef, "referidos");
  
    for (const r of referidos) {
      await addDoc(refsCol, {
        name: r.name || null,
        phone: r.phone || null,
        validated: false,
        contacted: false,
        createdAt: serverTimestamp(),
      });
    }
  
    await updateDoc(leadRef, {
      referidosCount: referidos.length,
    }).catch(() => {});
  }
  