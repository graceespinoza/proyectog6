const express = require('express');
const app = express();
const port = 8000;
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path'); // Agrega esta línea

//agregar estas lineas para configurar firebase admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./proyectofinalg6-262cd5b5e8ef.json'); // Cambia por tu archivo de credenciales Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});




// Configurar el cliente de Google Cloud Storage
const storage = new Storage({
  keyFilename: 'proyectofinalg6-262cd5b5e8ef.json' // Reemplaza con la ubicación de tus credenciales
});

// Configurar el cliente de Google Vision API
const visionClient = new vision.ImageAnnotatorClient();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const bucketName = 'proyecto_g6'; // Reemplaza con el nombre de tu bucket

// Configurar multer para manejar la carga de archivos
const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/Proyecto.html');
});

// Ruta para manejar la carga de la imagen y su análisis
app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No se ha subido ninguna imagen.');
  }

  const bucket = storage.bucket(bucketName);
  const fileName = Date.now() + '_' + file.originalname;

  // Guardar una copia local de la imagen
  const localFilePath = `uploads/${fileName}`;
  fs.writeFileSync(localFilePath, file.buffer);

  // Subir la imagen al bucket de Google Cloud Storage
  await bucket.upload(localFilePath);

  // Eliminar la copia local después de cargarla al bucket
  fs.unlinkSync(localFilePath);

  const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

  // Realizar el análisis de la imagen con Google Vision API
  const [result] = await visionClient.labelDetection(imageUrl);
  const labels = result.labelAnnotations.map(label => label.description);

  // Guardar la URL de la imagen y las etiquetas en Firestore
  const imageRef = db.collection('images').doc();
  await imageRef.set({
    imageUrl: imageUrl,
    labels: labels,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ labels });
});

  // Agregar esta ruta para recuperar imágenes y etiquetas almacenadas en Firestore
app.get('/images', async (req, res) => {
  const imagesSnapshot = await db.collection('images').get();
  const images = [];
  imagesSnapshot.forEach(doc => {
    images.push(doc.data());
  });

  res.json(images);
});


app.listen(port, () => {
  console.log('Server running on port', port);
});


