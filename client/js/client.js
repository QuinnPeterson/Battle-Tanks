window.addEventListener("beforeunload", function (event) {
  event.preventDefault();

  socket.emit("leaveGame", tankID);

  window.close();
});

var WIDTH = 1100;
var HEIGHT = 580;
// This IP is hardcoded to my server, replace with your own
// var socket = io.connect('https://quinn-tanks.herokuapp.com');
var socket = io.connect();
var game = new Game("#arena", WIDTH, HEIGHT, socket);
var selectedTank = 1;
var tankName = "";
var tankID;

let messageList = [];
const messageForm = document.getElementById("form");
const messageInput = document.getElementById("input");
const messageContainer = document.getElementById("messages");

socket.on("addTank", function (tank) {
  game.addTank(tank.id, tank.name, tank.type, tank.isLocal, tank.x, tank.y);
  tankID = tank.id;
});

socket.on("sync", function (gameServerData) {
  game.receiveData(gameServerData);
});

socket.on("killTank", function (tankData) {
  game.killTank(tankData);
});

socket.on("removeTank", function (tankId) {
  game.removeTank(tankId);
});

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

$(document).ready(function () {
  $("#join").click(function () {
    tankName = $("#tank-name").val();
    joinGame(tankName, selectedTank, socket);
  });

  $("#tank-name").keyup(function (e) {
    tankName = $("#tank-name").val();
    var k = e.keyCode || e.which;
    if (k == 13) {
      joinGame(tankName, selectedTank, socket);
    }
  });

  $("ul.tank-selection li").click(function () {
    $(".tank-selection li").removeClass("selected");
    $(this).addClass("selected");
    selectedTank = $(this).data("tank");
  });

  $("#death-prompt").click(function () {
    $("#death-prompt").hide();

    tankName = $("#tank-name").val();
    joinGame(tankName, selectedTank, socket);
  });
});

function joinGame(tankName, tankType, socket) {
  if (tankName != "") {
    $("#prompt").hide();
    $("#container").css("display", "flex");
    socket.emit("joinGame", { name: tankName, type: tankType });
  }
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`);
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

function appendMessage(message) {
  for (let i = 0; i < messageList.length; i++) {
    if (i >= 64) {
      messageList.shift();
      messageContainer.removeChild(messageContainer.firstChild);
    }
  }
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
  messageList.push(messageElement);
}
