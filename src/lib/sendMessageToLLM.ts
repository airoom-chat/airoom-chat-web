
import { scrollToBottom } from './scrollToBottom';
import { svgChatGPT, svgToken, svgTime, svgCopy, svgCopy2, API_ANONYMOUS } from './constants';
import { showUserMessage } from './showUserMessage';
import { showEnd } from './showEnd';

// Copy gpt message
function copyGPTMessage(ev: MouseEvent) {
  const target = ev.target as HTMLButtonElement;
  const gptMessageBox = target.closest('.received-msg') as HTMLDivElement;
  const gptMessage = gptMessageBox.querySelector('.whitespace-pre-wrap') as HTMLDivElement;
  const gptMessageText = gptMessage.textContent || '';
  navigator.clipboard.writeText(gptMessageText);

  const copyWrap = target.closest('.copied-wrap') as HTMLDivElement;
  const copyMsg = copyWrap.querySelector('.copied-msg') as HTMLDivElement;
  const copiedIcon = target.querySelector('.copied') as HTMLDivElement;
  const copyIcon = target.querySelector('.copy') as HTMLDivElement;
  if (copyMsg) {
    copyMsg.classList.remove('hidden');
  }
  if (copiedIcon) {
    copiedIcon.classList.remove('hidden');
  }
  if (copyIcon) {
    copyIcon.classList.add('hidden');
  }
  setTimeout(function(){
    if (copyMsg) {
      copyMsg.classList.add('hidden');
    }
    if (copiedIcon) {
      copiedIcon.classList.add('hidden');
    }
    if (copyIcon) {
      copyIcon.classList.remove('hidden');
    }
  }, 3000);
}

// Show footer message
function showFooterMessage(
  boxUser: HTMLDivElement,
  boxGPT: HTMLDivElement,
  info: any,
  timeDiff: number,
) {
  let footerUser = boxUser.querySelector('.footer-info') as HTMLDivElement;
  footerUser.innerHTML = `
    <span class="info-label opacity-30">
      ${svgToken}
    </span>
    <span class="token-num ml-1 text-sm">
      ${info.num_last_second}
    </span>
  `;
  //boxUser.appendChild(footerUser);

  let footerGPT = boxGPT.querySelector('.footer-info') as HTMLDivElement;
  footerGPT.innerHTML = `
    <span class="info-label opacity-30">
      ${svgToken}
    </span>
    <span class="token-num ml-1 text-sm">
      ${info.num_last_first}
    </span>
    <span class="gpt-time opacity-30 ml-2">
      ${svgTime}
    </span>
    <span class="duration ml-1 text-sm">
      ${timeDiff}s
    </span>
  `;

  let footerCopy = boxGPT.querySelector('.footer-copy') as HTMLDivElement;
  footerCopy.innerHTML = svgCopy2;
  const copyBtn = footerCopy.querySelector('.copybtn') as HTMLButtonElement;
  copyBtn.addEventListener('click', copyGPTMessage);
}

// Show loading gif
function showLoadingGif() {
  //const loading = document.querySelector('.loading') as HTMLDivElement;
  //loading.style.display = 'block';
  const msgpage = document.querySelector('.msg-page') as HTMLDivElement;
  let div = document.createElement('div');
  div.className = 'received-chats flex my-5 mr-10';
    //<div class="received-msg bg-gray-100">
  div.innerHTML = `
    <div class="received-chats-img mr-3 ml-5">
      ${svgChatGPT}
    </div>
    <div class="received-msg">
      <div class="received-msg-inbox p-3 h-11 rounded-lg shadow-[rgba(0,0,0,.25)_0px_5px_5px_2px] bg-gray-100">
        <div class="bg-[#efefef]">
          <img src="/images/loading.gif" alt="loading" class="leading-{0}" />
        </div>
      </div>
      <div class="flex">
        <div class="footer-info justify-start"></div>
        <div class="footer-copy justify-end"></div>
      </div>
    </div>
  `;

  msgpage.appendChild(div);
  scrollToBottom();
  return div;
}

// Return child for message presentation.
function gptMessageReplaceLoadingGif(gptMessageBox: HTMLDivElement) {
  let div = document.createElement('div');
  div.className = 'received-msg-inbox p-3 rounded-lg shadow-[rgba(0,0,0,.25)_0px_5px_5px_2px] bg-gray-100';
  let child = document.createElement('div');
  child.className = 'whitespace-pre-wrap bg-[#efefef] text-sm text-[#646464]';
  let footerInfo = document.createElement('div');
  footerInfo.className = 'footer-info flex';
  let footerCopy = document.createElement('div');
  footerCopy.className = 'footer-copy ';
  let footerWrap = document.createElement('div');
  footerWrap.className = 'flex justify-between items-center mt-3';
  footerWrap.appendChild(footerInfo);
  footerWrap.appendChild(footerCopy);
  div.appendChild(child);

  gptMessageBox.innerHTML = '';
  gptMessageBox.appendChild(div);
  gptMessageBox.appendChild(footerWrap);
  return child;
}

// Add new message
export function showChatGPTMessage(msg: string = '') {
  const msgpage = document.querySelector('.msg-page') as HTMLDivElement;
  let div = document.createElement('div');
  div.className = 'received-chats flex my-5 mr-10';
  div.innerHTML = `
    <div class="received-chats-img mr-3 ml-5">
      ${svgChatGPT}
    </div>
    <div class="received-msg bg-gray-100">
      <div class="received-msg-inbox p-3 rounded-lg shadow-[rgba(0,0,0,.25)_0px_5px_5px_2px]">
        <p id="test18" class="whitespace-pre-wrap
          bg-[#efefef] text-sm text-[#646464]"
        >${msg}</p>
        <span class="time"></span>
      </div>
    </div>
  `;

  msgpage.appendChild(div);
  scrollToBottom();
  return div;
}

/**
 * Send message.
 * Scenario 1: user input message, and click Enter
 * Scenario 2: user click Send button
 * Scenario 3: new session due to session length limit
 */
export function sendMessageToLLM(message: string = '') {
  if (message === '') {
    const messageBox = document.getElementById('message-textarea') as HTMLTextAreaElement;
    message = messageBox?.value;
    if (message === null || message.length === 0) {
      return;
    }

    // Clear message box
    messageBox.value = '';
  }

  // Display message
  //displayMessage(message);
  const userMessageBox = showUserMessage(message);

  const user_uuid = localStorage.getItem('user_uuid');
  const room_uuid = localStorage.getItem('room_uuid');
  const session_uuid = localStorage.getItem('session_uuid');
  if (!user_uuid || !room_uuid || !session_uuid) {
    console.error('sendMessage: user_uuid, room_uuid, session_uuid are null');
    return;
  }

  // show loading
  //const loading = document.querySelector('.loading') as HTMLDivElement;
  //loading.style.display = 'block';
  const gptMessageBox = showLoadingGif();
  const gptMessageBoxInbox = gptMessageBox.querySelector('.received-msg') as HTMLDivElement;

  // Timer
  const timerStart = Date.now();

  // Send message to server
  const data = {
    prompt: message,
    uid: user_uuid,
    rid: room_uuid,
    sid: session_uuid,
  }
  //const url = API.anonymous.message;
  const url = API_ANONYMOUS.message;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async function (response) {
    if (response.body === null) {
      throw new Error('res.body is null');
    }

    // send() response is a stream
    if (response.status === 300) {
      // The session closed, goto the new session.
      try {
        const sendInfo = await response.json();
        console.log('sendInfo:type: ', typeof sendInfo);
        console.log('sendInfo: ', sendInfo);
        //window.location.href = '/'
        window.location.href = `/room?uid=${user_uuid}&rid=${room_uuid}&sid=${sendInfo.new_session}`;
      } catch (e) {
        console.error('Error! JSON.parse failed: ', e);
      }
    } else {

    let reader = response.body.getReader();
    let decoder = new TextDecoder();
    //const aiMessage = showChatGPTMessage();
    //const aiSay = aiMessage.querySelector('#test18') as HTMLParagraphElement;
    const aiSay = gptMessageReplaceLoadingGif(gptMessageBoxInbox);
    let messageText = '';

    // origin code:
    //return readData();
    // change to (in order to add process after readData()):
    await readData();
    const timerEnd = Date.now();
    // Check if the session is closed
    const url = `${API_ANONYMOUS.session_stat}?uid=${user_uuid}&rid=${room_uuid}&sid=${session_uuid}`;
    try {
      const result = await fetch(url);
      const resultData = await result.json();
      console.log('resultData:1116: ', resultData)

      const timeDiff = Math.round((timerEnd - timerStart)/1000);
      showFooterMessage(userMessageBox, gptMessageBox, resultData, timeDiff);

      if (resultData.session_stat === 1) { // closed
        showEnd();
      }
    } catch (error) {
      console.log('Error 1023: ', error);
    }
    return ;

    function readData(): any {
          //const test18 = document.getElementById('test18');
          //if (test18 === null) {
          //  return;
          //}
          return reader.read().then(function ({value, done}) {
              if (value) {
                  let newData = decoder.decode(value, {stream: !done});
                  messageText += newData;
                  aiSay.textContent = messageText;
                  scrollToBottom();
              }
              if (done) {
                  console.log('end of stream');
                  return;
              }
              return readData();
          });
      }
    }
  });

}


