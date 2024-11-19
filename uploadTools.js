const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // Update this with your Firebase Admin SDK key file
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load your JSON file
const tools = JSON.parse(fs.readFileSync("tools.json", "utf8")); // Replace "tools.json" with your file name

// Upload each tool to Firestore
async function uploadTools() {
    console.log("Starting upload..."); // Log when the upload starts
    const batch = db.batch();
    tools.forEach((tool) => {
        const docRef = db.collection("tools").doc(tool.id); // Use the tool ID as the document ID
        batch.set(docRef, tool);
    });

    await batch.commit();
    console.log("Tools uploaded successfully!"); // Log when the upload completes
}

// Handle errors and call the function
uploadTools().catch((error) => console.error("Error uploading tools:", error));
