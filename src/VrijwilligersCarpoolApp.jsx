// src/VrijwilligersCarpoolApp.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export default function VrijwilligersCarpoolApp() {
  const [gebruiker, setGebruiker] = useState("");
  const [isIngelogd, setIsIngelogd] = useState(false);
  const [ritten, setRitten] = useState([]);
  const [nieuweRit, setNieuweRit] = useState({
    bestemming: "",
    datum: "",
    stoelen: "",
  });

  const ORG_CODE = "VRIJWILLIG123";
  const ADMIN_CODE = "ADMINDutch20";
  const [organisatieCode, setOrganisatieCode] = useState("");
  const [admin, setAdmin] = useState(false);

  // 🔹 Ophalen van ritten
  useEffect(() => {
    if (isIngelogd) laadRitten();
  }, [isIngelogd]);

  async function laadRitten() {
    const q = query(collection(db, "ritten"), orderBy("datum"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setRitten(data);
  }

  // 🔹 Nieuwe rit toevoegen
  async function ritToevoegen() {
    if (!nieuweRit.bestemming || !nieuweRit.datum || !nieuweRit.stoelen) return;
    await addDoc(collection(db, "ritten"), {
      ...nieuweRit,
      aangemaaktDoor: gebruiker,
      datum: new Date(nieuweRit.datum).toISOString(),
      stoelenVrij: parseInt(nieuweRit.stoelen, 10),
      deelnemers: [],
      status: "In afwachting",
    });
    setNieuweRit({ bestemming: "", datum: "", stoelen: "" });
    laadRitten();
  }

  // 🔹 Rit verwijderen (alleen admin)
  async function ritVerwijderen(id) {
    if (!admin) return;
    await deleteDoc(doc(db, "ritten", id));
    laadRitten();
  }

  // 🔹 Rit goedkeuren / afwijzen (admin)
  async function ritStatusBijwerken(id, nieuweStatus) {
    const ref = doc(db, "ritten", id);
    await updateDoc(ref, { status: nieuweStatus });
    laadRitten();
  }

  // 🔹 Aanmelden voor rit
  async function meldAanVoorRit(rit) {
    if (rit.deelnemers.includes(gebruiker)) return alert("Je bent al aangemeld!");
    if (rit.stoelenVrij <= 0) return alert("Geen stoelen meer beschikbaar!");
    const ref = doc(db, "ritten", rit.id);
    await updateDoc(ref, {
      deelnemers: [...rit.deelnemers, gebruiker],
      stoelenVrij: rit.stoelenVrij - 1,
    });
    laadRitten();
  }

// 🔹 Login (met Firebase admincontrole)
async function login() {
  if (!gebruiker || !organisatieCode) return;

  if (organisatieCode !== ORG_CODE) {
    alert("Verkeerde organisatiecode");
    return;
  }

  try {
    // 🔍 Ophalen van admins
    const q = query(collection(db, "admins"));
    const snapshot = await getDocs(q);

    // 👇 Log wat we vinden (voor controle)
    const adminNamen = snapshot.docs.map((d) => {
      const naam = d.data().naam?.trim().toLowerCase();
      console.log("📂 Gevonden admin:", naam);
      return naam;
    });

    const isAdminGebruiker = adminNamen.includes(gebruiker.trim().toLowerCase());
    console.log("✅ Ingelogde naam:", gebruiker.trim().toLowerCase());
    console.log("📋 Adminlijst:", adminNamen);
    console.log("👑 Is admin:", isAdminGebruiker);

    setIsIngelogd(true);
    setAdmin(isAdminGebruiker);
  } catch (error) {
    console.error("🔥 Fout bij admincontrole:", error);
  }
}




// 🔹 Uitloggen
function logout() {
  setGebruiker("");
  setOrganisatieCode("");
  setIsIngelogd(false);
  setAdmin(false);
}


  // 🔹 UI als niet ingelogd
  if (!isIngelogd) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">
          Vrijwilligers Carpool App 🚗
        </h1>
        <input
          className="border p-2 mb-2 rounded w-64"
          placeholder="Jouw naam"
          value={gebruiker}
          onChange={(e) => setGebruiker(e.target.value)}
        />
        <input
          className="border p-2 mb-2 rounded w-64"
          placeholder="Organisatiecode"
          value={organisatieCode}
          onChange={(e) => setOrganisatieCode(e.target.value)}
        />
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Inloggen
        </button>
      </div>
    );
  }

  // 🔹 UI als ingelogd
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        Vrijwilligers Carpool
      </h1>

{/* Admin banner */}
{admin && (
  <div className="bg-green-600 text-white text-center py-2 mb-4 rounded shadow-md">
    👑 Admin-paneel actief — je hebt beheerdersrechten
  </div>
)}


<div className="flex flex-col items-center mb-4">
  <p className="text-gray-600">
    Ingelogd als: <b>{gebruiker}</b>{" "}
    {admin && <span className="text-sm text-green-600">(admin)</span>}
  </p>
  <button
    onClick={logout}
    className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
  >
    Uitloggen
  </button>
</div>


      {/* Nieuwe rit aanmaken */}
      <div className="bg-white shadow-md p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Nieuwe rit toevoegen</h2>
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Bestemming"
          value={nieuweRit.bestemming}
          onChange={(e) =>
            setNieuweRit({ ...nieuweRit, bestemming: e.target.value })
          }
        />
        <input
          type="date"
          className="border p-2 mb-2 w-full rounded"
          value={nieuweRit.datum}
          onChange={(e) =>
            setNieuweRit({ ...nieuweRit, datum: e.target.value })
          }
        />
        <input
          type="number"
          className="border p-2 mb-2 w-full rounded"
          placeholder="Aantal stoelen"
          value={nieuweRit.stoelen}
          onChange={(e) =>
            setNieuweRit({ ...nieuweRit, stoelen: e.target.value })
          }
        />
        <button
          onClick={ritToevoegen}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Rit opslaan
        </button>
      </div>

      {/* Lijst van ritten */}
      <h2 className="text-xl font-semibold mb-3">Beschikbare ritten</h2>
      {ritten.length === 0 && (
        <p className="text-gray-500">Nog geen ritten toegevoegd.</p>
      )}

      {ritten.map((r) => (
        <div
          key={r.id}
          className="bg-white shadow-sm p-3 mb-3 rounded border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.bestemming}</p>
              <p className="text-sm text-gray-600">
                Datum: {new Date(r.datum).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Stoelen vrij: {r.stoelenVrij}
              </p>
              <p className="text-sm text-gray-600">
                Deelnemers: {r.deelnemers?.join(", ") || "Geen"}
              </p>
              <p
                className={`text-sm font-semibold ${
                  r.status === "Goedgekeurd"
                    ? "text-green-600"
                    : r.status === "Afgewezen"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                Status: {r.status}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {!admin && (
                <button
                  onClick={() => meldAanVoorRit(r)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Aanmelden
                </button>
              )}

           {admin && (
  <div className="border-t border-gray-300 mt-2 pt-2">
    <p className="text-xs text-gray-500 mb-1 text-center">Admin-acties</p>
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => ritStatusBijwerken(r.id, "Goedgekeurd")}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
      >
        Goedkeuren
      </button>
      <button
        onClick={() => ritStatusBijwerken(r.id, "Afgewezen")}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Afwijzen
      </button>
      <button
        onClick={() => ritVerwijderen(r.id)}
        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
      >
        Verwijderen
      </button>
    </div>
  </div>
)}


            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

