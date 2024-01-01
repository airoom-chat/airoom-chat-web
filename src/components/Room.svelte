
<script lang="ts">
  import { loader } from './loader';
  import { writable } from 'svelte/store';
  import { getRoom } from '../lib/accessRoom';
  import RoomDialogBox from './RoomDialogBox.svelte';
  import RoomSide from './RoomSide.svelte';
  import { scrollToBottom } from '../lib/scrollToBottom';
  import { sendMessageToLLM } from '$lib/sendMessageToLLM';
  import { showUserMessage } from '$lib/showUserMessage';
  import { showChatGPTMessage } from '$lib/sendMessageToLLM';
  import { showEnd } from '$lib/showEnd';
  import { svgTrash, API_ANONYMOUS } from '$lib/constants';

  let loading = writable(true);

  let roomName = '';
  let botName = '';
  let user_uuid = '';
  let room_uuid = '';
  let selectedSessionUuid = '';
  import { browser } from '$app/environment';
  if (browser) {
    //const user_uuid = localStorage.getItem('user_uuid');
    //const room_uuid = localStorage.getItem('room_uuid');
    //const session_uuid = localStorage.getItem('session_uuid');

    const searchParams = new URLSearchParams(window.location.search);
    user_uuid = searchParams.get('uid') || '';
    room_uuid = searchParams.get('rid') || '';
    const session_uuid = searchParams.get('sid') || '';
    selectedSessionUuid = ''; // To rename, delete

    const refreshHash = (url: string) => {
      window.location.hash = url;
    }

    /**
     * Add chat information
     */
    const showConversation = (session: any) => {
      let topic = session.topic === '' ? 'Untitled' : session.topic;
      const uid = session.user_uuid;
      const rid = session.room_uuid;
      const sid = session.uuid;
      const url = `/room?uid=${uid}&rid=${rid}&sid=${sid}`;
      // convert to local time
      //const localTime = new Date(session.created_at);
      //const time = localTime.toISOString().split('T')[1].split('.')[0];
      //const time = localTime.toISOString();
      const date = new Date(session.created_at);
      const year = date.toLocaleString("default", { year: "numeric" });
      const month = date.toLocaleString("default", { month: "2-digit" });
      const day = date.toLocaleString("default", { day: "2-digit" });
      const hour = date.toLocaleString("en-GB", { hour: "2-digit" });
      const minute = date.toLocaleString("default", { minute: "2-digit" });
      const second = date.toLocaleString("default", { second: "2-digit" });
      const time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

      const wrap = document.getElementById('conversation-list-wrap') as HTMLDivElement;
      const div = document.createElement('div') as HTMLDivElement;

      div.className = 'conversation-item border-t-2 px-2 py-1 rounded-md';
      div.innerHTML = `
        <div class="conversation-link flex" id="s${sid}-wrap">
          <a
            class="flex-1 hover:bg-slate-200"
            href="${url}"
          >
            <div class="conversation-topic">
              ${topic}
            </div>
            <div class="conversation-time text-sm opacity-70">
              ${time}
            </div>
          </a>
          <div
            class="text-right w-14 flex items-center ml-2"
          >
            <span id="s${sid}-delete"
              class="tooltip opacity-40 hover:opacity-90 cursor-pointer" data-tip="Delete session"
            >
              ${svgTrash}
            </span>
          </div>
        </div>
      `;

      const alink = div.querySelector('a');
      if (alink) {
        alink.addEventListener('click', (e) => {
          window.location.href = url;
        }, false);
      }
      wrap.appendChild(div);

      //if (div && (typeof div.querySelector === 'function')) {
      if (div) {
        div.querySelector(`#s${sid}-delete`)?.addEventListener('click', (e) => {
          e.preventDefault()

          selectedSessionUuid = sid;
          showDialog('deleteDialog')
        })
      }

      //div.querySelector(`#${sid}-editor`)?.addEventListener('click', (e) => {
      //  e.preventDefault()
      //  const modal = document.getElementById('renameDialog') as HTMLDialogElement;
      //  modal.showModal()
      //  showDialog('renameDialog')
      //})
    }

    getRoom({user_uuid, room_uuid, session_uuid}).then((room: any) => {
      loading.update(n => false);
      if (!room) {
        console.error('Error! room is null');
        return;
      }

      // Session 可能是新创建的，因此需要更新 localStorage
      const sid = room.session_uuid;

      if (room.session_stat && room.session_stat === -2) {
        window.location.href = `/room?uid=${user_uuid}&rid=${room_uuid}&sid=${sid}`;
      }

      roomName = room.room_name;
      botName = room.bot_name;

      // Show conversations on sidebar
      room.sessions?.forEach((session: any) => {
        showConversation(session);
      })

      // Update the current session.
      // Save user_uuid, room_uuid and session_uuid to localStorage
      if (room.sessions.length > 0 && user_uuid && room_uuid && sid) {
        localStorage.setItem('user_uuid', user_uuid);
        localStorage.setItem('room_uuid', room_uuid);
        localStorage.setItem('session_uuid', sid);
      }

      // stat == 2
      if (room.session_stat && room.session_stat === 2) {
        const userMessage = room.messages[0].content;
        sendMessageToLLM(userMessage);
      } else {
        // Show messages
        for (let i=0; i < room.messages.length; i++) {
          const msg = room.messages[i];
          if (msg.role === 'user') {
            showUserMessage(msg.content);
          } else if (msg.role === 'assistant') {
            showChatGPTMessage(msg.content);
          }
        }

        // closed?
        if (room.session_stat && room.session_stat === 1) {
          showEnd();
        }

        //scrollToBottom();
      }

      scrollToBottom();

      // focus on textarea
      const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
      textarea.focus();
    });

  }

  const confirmRenameDialog = () => {
    const modal = document.getElementById('renameDialog') as HTMLDialogElement;
    modal.close()
  }


  const closeDialog = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal.close();
  }

  const showDialog = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal.showModal()
  }

  const cancelRenameDialog = (e: any) => {
    e.preventDefault()
    closeDialog('renameDialog')
  }

  const confirmDeleteDialog = async () => {
    const uid = user_uuid;
    const rid = room_uuid;
    const sid = selectedSessionUuid;
    if (uid && rid && sid && uid.length > 10 && rid.length > 10 && sid.length > 10) {
      try {
        const url = `${API_ANONYMOUS.session_delete}?uid=${uid}&rid=${rid}&sid=${sid}`;
        const resp = await fetch(url);
        const result = await resp.json();
        console.log('result: ', result)
        if (result.statusCode === 200) {
          console.log('')
          const div = document.querySelector(`#s${sid}-wrap`) as HTMLDivElement;
          console.log('div: ', div)
          if (div) {
            console.log('remove')
            div.remove();
            closeDialog('deleteDialog')
          }
        } else if (result.statusCode === 1015) {
          const errinfo = document.querySelector('#deleteErrorInfo') as HTMLDivElement;
          errinfo.innerHTML = 'Error! Can\'t delete the last session.';
          errinfo.classList.remove('hidden');
        } else {
          console.error('Error! response: ', result);
        }
      } catch (e) {
        console.error('Error! e: ', e);
      }
    } else {
      console.error('Error! uid, rid or sid is null');
    }
  }

  const cancelDeleteDialog = (e: any) => {
    e.preventDefault()
    closeDialog('deleteDialog')
  }
</script>

<div class="grid grid-cols-1 xl:grid-cols-12 h-full">
  <div class="col-span-1 xl:col-span-10 xl:col-start-2 h-full">
    <div class="drawer lg:drawer-open h-full" use:loader={loading}>
      <input id="room-sidebar-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <RoomDialogBox />
      </div>

      <RoomSide
        roomTitle={roomName}
        botName={botName}
      />
    </div>
  </div>
  <dialog id="renameDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-6">Session Title</h3>
      <textarea class="textarea textarea-bordered w-full" placeholder="Title"></textarea>
      <div class="modal-action flex justify-center">
        <form method="dialog" on:submit|preventDefault={confirmRenameDialog}>
          <div class="flex justify-center items-center"></div>
          <div class="flex justify-center items-center">
            <button type="submit" class="btn mr-3">Submit</button>
            <a href="#" on:click={cancelRenameDialog}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </dialog>

  <dialog id="deleteDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-6">Confirm</h3>
        Are you sure to delete this session?
      <div class="modal-action flex justify-center">
        <form method="dialog" on:submit|preventDefault={confirmDeleteDialog}>
          <div class="flex justify-center items-center"></div>
          <div class="flex justify-center items-center">
            <button type="submit" class="btn mr-3">Submit</button>
            <a href="#" on:click={cancelDeleteDialog}>Cancel</a>
          </div>
        </form>
      </div>
      <div class="text-red-600 min-h-6">
        <div id="deleteErrorInfo" class="hidden">
          Error!
        </div>
      </div>
    </div>
  </dialog>
</div>
