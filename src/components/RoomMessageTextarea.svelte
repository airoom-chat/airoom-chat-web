
<script lang="ts">
  import { sendMessageToLLM } from '$lib/sendMessageToLLM'
  import SvgTrash from './SvgTrash.svelte'
  import { API_ANONYMOUS } from '$lib/constants';

  function clearSession() {
    const modal = document.getElementById('clearSessionDialog') as HTMLDialogElement;
    modal.showModal()
  }

  const confirmToClear = async () => {
    const modal = document.getElementById('clearSessionDialog') as HTMLDialogElement;
    modal.close();
    console.log('clear session 30')
    const searchParams = new URLSearchParams(window.location.search);
    const uid = searchParams.get('uid') || '';
    const rid = searchParams.get('rid') || '';
    const sid = searchParams.get('sid') || '';

    const url = `${API_ANONYMOUS.session_clear}?uid=${uid}&rid=${rid}&sid=${sid}`;
    const result = await fetch(url);
    const clearJson = await result.json();
    console.log('kkk:: ', clearJson)
    if (clearJson.statusCode === 200) {
      const msgbox = document.getElementById('msgbox') as HTMLDivElement;
      msgbox.innerHTML = `
        <div class="msg-page pb-12">
          <div class="received-chats flex justify-center my-3 font-light">
            --- Conversation starts ---
          </div>
        </div>
      `

      // focus on textarea
      const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
      textarea.focus();
    }
  }

  const cancelClearDialog = (e: any) => {
    e.preventDefault()
    const modal = document.getElementById('clearSessionDialog') as HTMLDialogElement;
    modal.close();
  }

  function handleKeyDown(evt: KeyboardEvent) {
    // Ctrl + Enter
    //if (evt.key === 'Enter' && (evt.metaKey || evt.ctrlKey)) {

    if (evt.key === 'Enter') {
      evt.preventDefault();
      sendMessageToLLM();
    }
  }

  function clickSendButton() {
    sendMessageToLLM();
  }

</script>


<div class="msg-bottom sticky bottom-0 border-t ">
  <div class="flex items-center pt-1">
    <div class="w-9/12">
      <div class="opacity-50 grid justify-items-end">
        <button class="btn btn-sm cursor-pointer tooltip normal-case" data-tip="Clear session" on:click={clearSession}>
          <SvgTrash />
        </button>
      </div>
      <textarea
        id="message-textarea"
        class="textarea textarea-md leading-normal text-base resize-none border-none focus:outline-none focus:ring-0"
        placeholder="Write message ..."
        on:keydown={handleKeyDown}
      ></textarea>
    </div>

    <button class="btn btn-outline btn-accent capitalize ml-7"
      on:click={clickSendButton}
    >
      Send
    </button>
  </div>
</div>

<dialog id="clearSessionDialog" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-6">Confirm</h3>
      Are you sure to clear all messages in this session?
    <div class="modal-action flex justify-center">
      <form method="dialog" on:submit|preventDefault={confirmToClear}>
        <div class="flex justify-center items-center"></div>
        <div class="flex justify-center items-center">
          <button type="submit" class="btn mr-3">Yes</button>
          <a href="/" on:click={cancelClearDialog}>Cancel</a>
        </div>
      </form>
    </div>
  </div>
</dialog>
