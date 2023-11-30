
  // Scroll to bottom of message box
  export function scrollToBottom() {
    const msgbox = document.getElementById('msgbox') as HTMLDivElement;
    msgbox.scrollTop = msgbox.scrollHeight;
  }
