// Describe the basic constants for Video chat
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header-back");
myVideo.muted = true;

//Describe the click on backBtn 

backBtn.addEventListener("click", () => {
  document.querySelector(".m-left").style.display = "flex";
  document.querySelector(".m-left").style.flex = "1";
  document.querySelector(".m-right").style.display = "none";
  document.querySelector(".header-back").style.display = "none";
});

//Describe the click on showChat

showChat.addEventListener("click", () => {
  document.querySelector(".m-right").style.display = "flex";
  document.querySelector(".m-right").style.flex = "1";
  document.querySelector(".m-left").style.display = "none";
  document.querySelector(".header-back").style.display = "block";
});

// User enters his nickname

const user = prompt("Enter your nickname");

// Descripe peerjs(simplifies WebRTC peer-to-peer)

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});


//Describe Videostream, The audio and video connection is being checked 
//and a connection is being established

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

//Connect to new user

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

// Creat socket to this connection

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

// Video starts

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

// Describe text chat

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

//Describe Event Listener for text chat

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

//Describe buttons("stop video", "mute" and "invite")

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background-stop");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background-stop");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background-stop");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background-stop");
    stopVideo.innerHTML = html;
  }
});

//Invite to chat Event Listener

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to the person you want to meet",
    window.location.href
  );
});

// Message displaying for text chat
socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});
