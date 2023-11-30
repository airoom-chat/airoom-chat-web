
import { scrollToBottom } from './scrollToBottom'
import { svgUser } from './constants'

export const showUserMessage = (msg: string) => {
  const msgpage = document.querySelector('.msg-page') as HTMLDivElement;
  let div = document.createElement('div');
  div.innerHTML = `
    <div class="outgoing-chats flex flex-row-reverse my-5 ml-10">
      <div class="outgoing-chats-img w-6 mr-5 ml-3">
        ${svgUser}
      </div>
      <div class="outgoing-msg">
        <div class="outgoing-chats-msg bg-green-400 p-3 rounded-lg shadow-[rgba(0,0,0,.25)_0px_5px_5px_2px]">
          ${msg}
        </div>
        <div class="footer-info flex justify-end mt-4 min-h-[24px]"></div>
      </div>
    </div>
  `;
  msgpage.appendChild(div);
  scrollToBottom();
  return div;
}
