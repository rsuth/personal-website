var context;
var samples;
var sequence;
var sequenceLength = 16;
var notesQueue = [];
var current16thNote = 0;
var tempo = 120.0;
var lookahead = 25.0;
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;
var isPlaying = false;
var timerWorker = null;
var last16thNoteDrawn = -1;
var activePlayheadNote;
var compressor = 0;

const defaultSamples = [
  "sounds/hitom.wav",
  "sounds/clhat.wav",
  "sounds/sn.wav",
  "sounds/bd.wav",
];

function init() {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    compressor = context.createDynamicsCompressor();
    compressor.connect(context.destination);

    samples = new Array(defaultSamples.length);

    for (let i = 0; i < samples.length; i++) {
      loadSample(defaultSamples[i], i);
    }

    sequence = [
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    ];
  } catch (e) {
    console.log(e);
    alert("WebAudio API is not supported by your browser.");
  }

  buildSequencer();
  requestAnimationFrame(draw);
  timerWorker = new Worker("clockWorker.js");
  timerWorker.onmessage = function (e) {
    if (e.data == "tick") {
      scheduler();
    } else console.log("message: " + e.data);
  };
  timerWorker.postMessage({ interval: lookahead });
}

function loadSample(url, slot) {
  if (slot >= 0 && slot < samples.length) {
    var request = new XMLHttpRequest();

    request.open("GET", url, true);

    request.responseType = "arraybuffer";

    request.onload = () => {
      var audioData = request.response;
      context.decodeAudioData(audioData).then((buffer) => {
        samples[slot] = buffer;
      });
    };

    request.send();
  }
}

function makeButton(id, label, parentEl, onclick) {
  var btn = document.createElement("BUTTON");
  btn.id = id;
  btn.innerHTML = label;
  btn.addEventListener("click", onclick);
  parentEl.appendChild(btn);
}

function playSlot(slot, time) {
  if (samples[slot]) {
    let s = context.createBufferSource();
    s.buffer = samples[slot];
    s.connect(compressor);
    s.start(time);
  }
}

function scheduleNote(beatNumber, slot, time) {
  notesQueue.push({ note: beatNumber, time: time });
  if (sequence[slot][beatNumber] == 1) {
    playSlot(slot, time);
  }
}

function scheduler() {
  while (nextNoteTime < context.currentTime + scheduleAheadTime) {
    for (let i = 0; i < samples.length; i++) {
      scheduleNote(current16thNote, i, nextNoteTime);
    }
    nextNote();
  }
}

function playSeq() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    current16thNote = 0;
    nextNoteTime = context.currentTime;
    timerWorker.postMessage("start");
    return "stop";
  } else {
    timerWorker.postMessage("stop");
    return "play";
  }
}

function nextNote() {
  var secondsPerBeat = 60.0 / tempo;
  nextNoteTime = nextNoteTime + 0.25 * secondsPerBeat;

  current16thNote++;
  if (current16thNote == 16) {
    current16thNote = 0;
  }
}

function draw() {
  var currentNote = last16thNoteDrawn;
  var currentTime = context.currentTime;

  while (notesQueue.length && notesQueue[0].time < currentTime) {
    currentNote = notesQueue[0].note;
    notesQueue.splice(0, 1);
  }

  if (last16thNoteDrawn != currentNote) {
    updatePlayHead(currentNote);
    last16thNoteDrawn = currentNote;
  }

  requestAnimationFrame(draw);
}

function updatePlayHead(currentNote) {
  if (isPlaying) {
    var prev = currentNote == 0 ? 15 : currentNote - 1;
    document.getElementById("playhead" + prev).classList.remove("active");
    document.getElementById("playhead" + currentNote).classList.add("active");
    activePlayheadNote = currentNote;
  }
}

function buildSequencer() {
  var container = document.getElementById("sequencer");
  var sequencerTable = document.createElement("TABLE");
  var playheadRow = document.createElement("TR");
  playheadRow.id = "playhead-row";

  var playbtn = document.createElement("BUTTON");
  playbtn.innerText = "play";
  playbtn.id = "playbtn";

  playbtn.onclick = (e) => {
    e.target.innerText = playSeq();
    let a = document.getElementsByClassName("active")[0];
    if (a) {
      a.classList.remove("active");
    }
  };

  let p = document.createElement("TD");
  p.appendChild(playbtn);
  playheadRow.appendChild(p);

  for (let i = 0; i < sequenceLength; i++) {
    var playheadGrid = document.createElement("TD");
    playheadGrid.classList.add("playhead-cell");
    playheadGrid.id = "playhead" + i;
    playheadRow.appendChild(playheadGrid);
  }
  sequencerTable.appendChild(playheadRow);

  for (let i = 0; i < sequence.length; i++) {
    var sequencerRow = document.createElement("TR");
    let t = document.createElement("TD");
    makeButton("slot" + i, "slot " + i, t, () => {
      playSlot(i);
    });
    sequencerRow.appendChild(t);
    for (let j = 0; j < sequence[i].length; j++) {
      var sequencerGrid = document.createElement("TD");

      sequencerGrid.classList.add("step");
      if (sequence[i][j] == 1) {
        sequencerGrid.classList.add("on");
      }

      sequencerGrid.addEventListener("click", (e) => {
        sequence[i][j] = 1 - sequence[i][j];
        e.target.classList.remove("on");
        if (sequence[i][j] == 1) {
          e.target.classList.add("on");
        }
      });

      sequencerRow.appendChild(sequencerGrid);
    }

    sequencerTable.appendChild(sequencerRow);
  }

  container.replaceChild(sequencerTable, container.childNodes[0]);
}

window.onload = init;
