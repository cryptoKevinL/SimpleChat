const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const msgerMyName = get(".msger-name");
const msgerSendTo = get(".msger-sendto");
const msgerSendToNickname = get(".msger-sendname");
let restApiUrl = 'https://litchatrestapi.herokuapp.com/users';
let streamID = 'this should never work'; // test data

let selectedWalletAddress = "none"; // Icons made by Freepik from www.flaticon.com

let BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
let PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
let PERSON_NAME = "You"; //start of copy from LitChat

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContent.........');
  window.ethereum.request({
    method: "eth_requestAccounts"
  });
});

const fetchPost = data => {
  fetch(` ${restApiUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => response.json()) //Then with the data from the response in JSON...
  .then(data => {
    console.log('$$$kl - Post to REST API:', data);
  }) //Then with the error genereted...
  .catch(error => {
    console.error('Post to REST API error!!!!!!!!!!!!:', error);
  });
};

const fetchPut = (data, id) => {
  fetch(` ${restApiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => response.json()) //Then with the data from the response in JSON...
  .then(data => {
    console.log('$$$kl - PUT to REST API:', data);
  }) //Then with the error genereted...
  .catch(error => {
    console.error('PUT to REST API error!!!!!!!!!!!!:', error);
  });
};

const updateStreamID = resp => {
  streamID = resp;
  console.log('Message sending to REST API: ', streamID);
  selectedWalletAddress = window.ethereum.selectedAddress; //Obj of data to send in future like a dummyDb

  const sendToAddress = msgerSendTo.value;
  const commonName = msgerMyName.value;
  const data = {
    streamID: `${streamID}`,
    fromName: `${commonName}`,
    fromAddr: `${selectedWalletAddress}`,
    toAddr: `${sendToAddress}`,
    read: false
  }; //POST request with body equal on data in JSON format

  fetchPost(data);
};

function addMessageReceiver(message, fromName, restApiMsgId) {
  console.log("adding message:", message);

  if (message === "FALSE") {
    console.log("updating message: ", message);
    message = "<MSG UNSENT>"; //signal that the sender undsent the original message by removing decryption permissions
  } //const delay = message.split(" ").length * 100;
  //setTimeout(() => {


  appendMessage(fromName, BOT_IMG, "left", message); //}, delay);
}

function addMessageSender(message, fromName, wasRead, restApiMsgId) {
  // if(wasRead == true)
  //   textspan.appendChild(document.createTextNode(`${message}` + " (READ) (msgId:" + `${restApiMsgId}` + ")"));
  // else if(wasRead == "unsent")
  //   textspan.appendChild(document.createTextNode(`${message}` + " (UNSENT) (msgId:" + `${restApiMsgId}` + ")"));
  // else
  //   textspan.appendChild(document.createTextNode(`${message}` + " (UNREAD) (msgId:" + `${restApiMsgId}` + ")"));
  appendMessage(PERSON_NAME, PERSON_IMG, "right", message);
}

function updateChatData() {
  //GET request to get off-chain data for RX user
  fetch(` ${restApiUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json()) //Then with the data from the response in JSON...
  .then(data => {
    //console.log('$$$kl - GET to REST API:', data);
    //sort by msgID - this is slow but simple for demo
    // let sortedData = [];
    // while(sortedData.length < data.length){
    //   for(let i=0; i<data.length; i++){
    //     if(data[i].id == sortedData.length+1){
    //       sortedData.push(data[i]);
    //       console.log("pushing id: ", data[i].id)
    //       break;
    //     }
    //   }
    // }
    // data = sortedData;
    // @ts-ignore
    //const test = document.getElementById('sendaddr').value;
    for (let i = 0; i < data.length; i++) {
      console.log("processing id: ", data[i].id);
      const streamToDecrypt = data[i].streamID;

      if (data[i].toAddr.toLowerCase() == selectedWalletAddress.toLowerCase()) {
        console.log('$$$kl - this is the TO streamID youre decrypting: ', streamToDecrypt);
        addMessageReceiver(data[i].streamID, data[i].fromName, data[i].id); //mark as read if box is checked
        // if(document.getElementById('readReceipts').checked && data[i].read != "unsent") {
        //   console.log('$$$kl - marking READ for streamID: ', streamToDecrypt)
        //   const putData = { streamID: `${data[i].streamID}`, fromName: `${data[i].fromName}`, fromAddr: `${data[i].fromAddr}`, toAddr: `${data[i].toAddr}`, read: true }
        //   fetchPut(putData, data[i].id)
        // }
        // else {
        //   console.log('$$$kl - read receipts is not checked, going rogue')
        // }
      } //print sent messages
      else if (data[i].fromAddr.toLowerCase() == selectedWalletAddress.toLowerCase()) {
        console.log('$$$kl - this is the FROM streamID youre decrypting: ', streamToDecrypt);
        addMessageSender(data[i].streamID + "\n", data[i].fromName, data[i].read, data[i].id);
      }
    }
  }) //Then with the error genereted...
  .catch(error => {
    console.error('GET to REST API error!!!!!!!!!!!!:', error);
  });
} //end LitChat copied functions


msgerForm.addEventListener("submit", event => {
  event.preventDefault();
  const msgText = msgerInput.value;
  if (!msgText) return;
  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = ""; //TODO: need a better way to update more incrementally.

  updateChatData(); //send to REST API for storage

  updateStreamID(msgText);
});

function appendMessage(name, img, side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
} // function botResponse() {
//   const r = random(0, BOT_MSGS.length - 1);
//   const msgText = BOT_MSGS[r];
//   const delay = msgText.split(" ").length * 100;
//   setTimeout(() => {
//     appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
//   }, delay);
// }
// Utils


function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}