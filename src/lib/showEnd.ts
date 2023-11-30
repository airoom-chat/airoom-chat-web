
export const showEnd = () => {
  const msgpage = document.querySelector('.msg-page') as HTMLDivElement;
  const div = document.createElement('div');
  div.className = 'received-chats flex justify-center my-3 font-light';
  div.innerHTML = '--- Conversation ends ---';
  msgpage.appendChild(div);
}
