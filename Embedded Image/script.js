let webcamStream;
let model;
let classes;

async function setupCamera() {
  const webcamElement = document.getElementById("webcam");
  if (navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamStream = stream;
    webcamElement.srcObject = stream;
    return new Promise((resolve) => {
      webcamElement.onloadedmetadata = () => {
        resolve();
      };
    });
  }
}

async function loadModel() {
  const modelURL = "model.json";
  const metadataURL = "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
}

async function predict() {
  const webcamElement = document.getElementById("webcam");
  const predictionContainer = document.getElementById("prediction-container");

  // Capture a frame from the webcam
  const image = await tf.browser.fromPixels(webcamElement);

  // Make a prediction using the loaded model
  const resizedImage = tf.image.resizeBilinear(image, [96, 96]);
  const batchedImage = resizedImage.expandDims(0);
  const predictions = await model.predict(batchedImage).data();

  const maxPrediction = Math.max(...predictions);
  const predictedIndex = predictions.indexOf(maxPrediction);
  const predictedClass = classes[predictedIndex];
  predictionContainer.innerText = `Predicted Class: ${predictedClass}`;
}

document.getElementById("startButton").addEventListener("click", () => {
  setupCamera()
    .then(loadModel)
    .then(() => {
      document.getElementById("startButton").disabled = true;
      document.getElementById("detectButton").disabled = false;
      classes = document
        .getElementById("classesInput")
        .value.split(",")
        .map((item) => item.trim());
    })
    .catch((error) => {
      console.error("Error setting up camera:", error);
    });
});

document.getElementById("detectButton").addEventListener("click", () => {
  predict();
});

// When the page is unloaded, stop the webcam stream
window.addEventListener("beforeunload", () => {
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
  }
});
