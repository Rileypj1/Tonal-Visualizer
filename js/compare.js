$(document).ready(function () {
  const audioCtx = new AudioContext();
  let gainNode = audioCtx.createGain(); // Declare gain node
  let analyser = audioCtx.createAnalyser();
  let distortion = audioCtx.createWaveShaper();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;
  gainNode.gain.value = 0.5;

  let biquadFilter = audioCtx.createBiquadFilter();
  let convolver = audioCtx.createConvolver();
  //I am using the jQuery ui slider as a volume slider to adjust the volume directly in the browser. To do this, the value on the slider needs to be connected to the gainNode, which is from the Web Audio API for adjusting the volume level of the .mp3 file being used
  $("#slider").slider({
    value: 75,
    step: 1,
    range: "min",
    min: 0,
    max: 100,
    slide: function (event, ui) {
      //   document.getElementById("audio-player").volume = value / 100;
      gainNode.gain.value = parseFloat(ui.value / 100);
    },
  });

  const load = (event) => {
    let index = Number(event.target.value);
    const request = new XMLHttpRequest();
    //file names are all the same with the tone being the difference.
    request.open("GET", `sounds/zhuang${index}_FV2_MP3.mp3`);

    request.withCredentials = false;
    request.responseType = "arraybuffer";
    request.onload = function () {
      let undecodedAudio = request.response;

      audioCtx.decodeAudioData(undecodedAudio, (data) => (buffer = data));
    };
    request.send();
  };
  const play = () => {
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
  };

  $("#tones").on("click", load);
  $("#audio-player").on("click", play);
  //need a class for a list of the mp3 files
  let canvas = document.querySelector(".visualizer");
  let canvasCtx = canvas.getContext("2d");

  let intendedWidth = document.querySelector(".wrapper").clientWidth / 2;
  canvas.setAttribute("width", intendedWidth);
  //the function visualize is first setting the parameters of the canvas tag. I chose frequency bar graph to visualize the frequency of the recording, to understand the speaker's tone and pitch
  let drawVisual;
  function visualize() {
    let source = audioCtx.createBufferSource();
    source.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    convolver.connect(gainNode);
    gainNode.connect(analyser);
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
  visualize();
});
