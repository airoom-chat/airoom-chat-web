
import { scrollToBottom } from './scrollToBottom';
import { svgChatGPT, svgToken, svgTime, svgCopy, svgCopy2, API} from './constants';
import { showUserMessage } from './showUserMessage';
import { showEnd } from './showEnd';
import { roominfo } from '../stores'

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

function showAnAnswer(answer: string) {
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
      ${answer}
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

// Talk to Assistant
async function talkToAssistant(data: any, access_token: string, gptMessageBox: HTMLDivElement) {
  data.timestamp = Math.floor(Date.now() / 1000);
  console.log('data: ', data)
  const result = await fetch(API.assistant_message, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });
  const resultData = await result.json();
  console.log('resuL: ', resultData)
  if (resultData.statusCode === 200) {
    const info = {
      thread_id: resultData.thread_id,
      run_id: resultData.run_id,
      access_token: access_token,
    }
    // Request run status
    const requestRunStatus = (count: number, info: any) => {
      console.log('count: ', count)
      if (count > 30) {
        console.log('cancel requestRunStatus')
        return;
      }

      setTimeout(async () => {
        const url = `${API.assistant_run}?thread_id=${info.thread_id}&run_id=${info.run_id}&timestamp=${data.timestamp}`;
        const r = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.access_token}`,
          }
        });
        const d = await r.json();
        if (d && d.statusCode === 200) {
          console.log('donel le')
          console.log('d: ', d)
          for (let i = 0; i < d.answers.length; i++) {
            const answer = d.answers[i];
            if (i === 0) {
              const aiSay = gptMessageReplaceLoadingGif(gptMessageBox);
              aiSay.textContent = answer;
            } else {
              showAnAnswer(answer);
            }
            scrollToBottom();
          }
        } else {
          requestRunStatus(count + 1, info);
        }
      }, 1000 + Math.floor(Math.random() * 5) * 1000);
    }

    // Check run
    requestRunStatus(0, info);
  }
}

function talkToAssistant_ws() {
  console.log('inside: talkToAssistant');
  /*
  console.log('API.ws: ', API.ws)
  const socket = new WebSocket(API.ws);

  socket.addEventListener('open', (event) => {
    console.log('Connected to WebSocket server');
    socket.send('Hello, server!');
  });

  socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
  });

  socket.addEventListener('close', (event) => {
    console.log('Disconnected from WebSocket server');
  });
  */
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

  const access_token = localStorage.getItem('access_token');
  if (!access_token || access_token.length < 10) {
    console.error('sendMessage: access_token is null');
    return;
  }

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const session_uuid = urlParams.get('sid') || '';
  const room_uuid = urlParams.get('rid') || '';
  if (room_uuid === '') {
    console.error('sendMessage: room_uuid is null');
    return;
  }

  const data = {
    prompt: message,
    rid: room_uuid,
    sid: session_uuid,
  }

  // show loading
  const gptMessageBox = showLoadingGif();
  const gptMessageBoxInbox = gptMessageBox.querySelector('.received-msg') as HTMLDivElement;

  // Is assistant?
  let botType = 0;
  roominfo.subscribe((val) => {
    //console.log('roominfo: ', val)
    botType = val.bot_type;
  });
  if (botType === 1) {
    talkToAssistant(data, access_token, gptMessageBoxInbox);
    return;
  }

  // Not assistant, is a model.

  // Timer
  const timerStart = Date.now();

  // Send message to server
  fetch(API.message, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
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
        window.location.href = `/r?rid=${room_uuid}&sid=${sendInfo.new_session}`;
      } catch (e) {
        console.error('Error! JSON.parse failed: ', e);
      }
    } else {
      let reader = response.body.getReader();
      let decoder = new TextDecoder();
      const aiSay = gptMessageReplaceLoadingGif(gptMessageBoxInbox);
      let messageText = '';

      await readData();
      const timerEnd = Date.now();
      // Check if the session is closed
      const urlStat = `${API.session_stat}?rid=${room_uuid}&sid=${session_uuid}`;
      try {
        const result = await fetch(urlStat, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
        });
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
