
<script lang="ts">

  import SvgChatGPT35 from './SvgChatGPT35.svelte';
  import { API_ANONYMOUS } from '../lib/constants';
  import { browser } from '$app/environment';

  export let roomTitle: string = '';

  // End the current chat, and start a new one.
  async function newChat() {
    if (!browser) {
      return;
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const uid = urlParams.get('uid') || '';
    const rid = urlParams.get('rid') || '';
    const sid = urlParams.get('sid') || '';
    const url = `${API_ANONYMOUS.session_end}?uid=${uid}&rid=${rid}&sid=${sid}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.statusCode === 200) {
      const newSessionUuid = data.new_session_uuid;
      const newSessionUrl = `/room?uid=${uid}&rid=${rid}&sid=${newSessionUuid}`;
      window.location.href = newSessionUrl;
    } else {
      console.log('error')
    }
  }

</script>

  <div class="drawer-side h-full">
    <label for="room-sidebar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <div class="flex flex-col p-0 w-80 min-h-full bg-base-200 text-base-content">
      <div class="grid justify-items-center border-b-2 border-sky-500 h-12 no-hover">
        <div class="title bg-base-200
                    flex items-center text-lg font-medium">
          {roomTitle}
        </div>
      </div>
      <div class="border-b-2">
        <div class="flex room-role h-30 mx-5 my-3">
          <div class="chatgpt-3.5-icon mr-3">
            <SvgChatGPT35 />
          </div>
          <div class="role-name">
            gpt-3.5-turbo
          </div>
        </div>
      </div>
      <div class="conversations mb-auto mx-5 my-3 max-h-72 overflow-auto">
        <div class="panel-title mb-2 text-lg font-medium">
          Conversations
        </div>
        <div id="conversation-list-wrap"></div>
      </div>
      <div class="tools h-14 flex justify-center">
        <div class="clear-button w-40">
          <button class="btn btn-accent btn-sm lowercase" on:click={newChat}>
            New chat
          </button>
        </div>
      </div>
    </div>
  </div>
