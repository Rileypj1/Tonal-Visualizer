//part of the code related to the audio references the MDN code examples at mdn.github.io
$(document).ready(function () {
  // Top-level variable keeps track of whether we are recording or not.
  let recording = false;

  // Ask user for access to the microphone.
  if (navigator.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Instantiate the media recorder.
        const mediaRecorder = new MediaRecorder(stream);

        // Create a buffer to store the incoming data.
        let chunks = [];
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        // When you stop the recorder, create an empty audio clip.
        mediaRecorder.onstop = (event) => {
          const audio = new Audio();
          audio.setAttribute("controls", "");
          audio.setAttribute("id", "voice-recording");
          $("#sound-clip").append(audio);
          $("#sound-clip").append("<br />");

          // Combine the audio chunks into a blob, then point the empty audio clip to that blob.
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          audio.src = window.URL.createObjectURL(blob);
          console.log(audio);

          // Clear the `chunks` buffer so that you can record again.
          chunks = [];
          let audioHTML = document.getElementById("voice-recording");
          //visualize using the frequency bars based on the newly created audio tag
          audioHTML.addEventListener("play", visualize);
        };

        // Set up event handler for the "Record" button.
        $("#record").on("click", () => {
          if (recording) {
            mediaRecorder.stop();
            recording = false;
            $("#record").html("Record");
          } else {
            mediaRecorder.start();
            recording = true;
            $("#record").html("Stop");
          }
        });
      })
      .catch((err) => {
        // Throw alert when the browser is unable to access the microphone.
        alert("Oh no! Your browser cannot access your computer's microphone.");
      });
  } else {
    // Throw alert when the browser cannot access any media devices.
    alert(
      "Oh no! Your browser cannot access your computer's microphone. Please update your browser."
    );
  }
  let canvas = document.querySelector(".visualizer");
  let canvasCtx = canvas.getContext("2d");

  let intendedWidth = document.querySelector(".wrapper").clientWidth / 2;
  canvas.setAttribute("width", intendedWidth);
  let drawVisual;
  function visualize() {
    const audioCtx = new AudioContext();
    let gainNode = audioCtx.createGain(); // Declare gain node
    let analyser = audioCtx.createAnalyser();
    // let distortion = audioCtx.createWaveShaper();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    gainNode.gain.value = 0.5;
    //function won't work unless I capture the audio element within this function
    let audioHTML = document.getElementById("voice-recording");
    let source = audioCtx.createMediaElementSource(audioHTML);
    // let biquadFilter = audioCtx.createBiquadFilter();
    // let convolver = audioCtx.createConvolver();
    // source.connect(distortion);
    // distortion.connect(biquadFilter);
    // biquadFilter.connect(gainNode);
    // convolver.connect(gainNode);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    analyser.fftSize = 256;
    let bufferLengthAlt = analyser.frequencyBinCount;
    console.log(bufferLengthAlt);
    let dataArrayAlt = new Uint8Array(bufferLengthAlt);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function drawAlt() {
      drawVisual = requestAnimationFrame(drawAlt);

      analyser.getByteFrequencyData(dataArrayAlt);

      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      let barWidth = (WIDTH / bufferLengthAlt) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLengthAlt; i++) {
        barHeight = dataArrayAlt[i];

        canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    }
    drawAlt();
  }
});
