
<script lang="ts">
  import { sendMessageToLLM } from '$lib/sendMessageToLLM_r'

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

<div class="msg-bottom sticky bottom-0">
  <div class="flex items-center">
    <textarea
      id="message-textarea"
      class="textarea textarea-md leading-normal text-base w-9/12 resize-none border-none focus:outline-none focus:ring-0"
      placeholder="Write message ..."
      on:keydown={handleKeyDown}
    ></textarea>

    <button class="btn btn-outline btn-accent capitalize ml-7"
      on:click={clickSendButton}
    >
      Send
    </button>
  </div>
</div>
