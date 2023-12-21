
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

  let loading = writable(true);

  let roomName = '';
  let botName = '';
  import { browser } from '$app/environment';
  if (browser) {
    //const user_uuid = localStorage.getItem('user_uuid');
    //const room_uuid = localStorage.getItem('room_uuid');
    //const session_uuid = localStorage.getItem('session_uuid');

    const searchParams = new URLSearchParams(window.location.search);
    const user_uuid = searchParams.get('uid') || '';
    const room_uuid = searchParams.get('rid') || '';
    const session_uuid = searchParams.get('sid') || '';

    const refreshHash = (url: string) => {
      window.location.hash = url;
    }

    /**
     * 添加聊天窗口的会话信息
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
      const div = document.createElement('div');

      div.className = 'conversation-item border-t-2 hover:bg-slate-200 px-2 py-1 rounded-md';
      div.innerHTML = `
        <div class="conversation-link flex">
          <a
            class="flex-1"
            href="${url}"
          >
            <div class="conversation-topic">
              ${topic}
            </div>
            <div class="conversation-time">
              ${time}
            </div>
          </a>
          <div
            class="text-right w-14 flex items-center hidden"
          >
            <i id="${sid}-delete" class="bi bi-trash cursor-pointer "></i>
            <i id="${sid}-editor" class="bi bi-pencil-square ps-1 cursor-pointer ms-1"></i>
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

      //if (div) {
      //div.querySelector(`#${sid}-delete`)?.addEventListener('click', (e) => {
      //  e.preventDefault()
      //  showDialog('deleteDialog')
      //})
      //}

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

  const confirmDeleteDialog = () => {
    // 此处编写删除逻辑
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
      <h3 class="font-bold text-lg mb-6">修改会话标题</h3>
      <textarea class="textarea textarea-bordered w-full" placeholder="请输入新标题信息......"></textarea>
      <div class="modal-action flex justify-center">
        <form method="dialog" on:submit|preventDefault={confirmRenameDialog}>
          <div class="flex justify-center items-center"></div>
          <div class="flex justify-center items-center">
            <button type="submit" class="btn mr-3">Submit</button>
            <a href="/" on:click={cancelRenameDialog}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </dialog>

  <dialog id="deleteDialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-6">系统消息</h3>
      是否确认删除会话 ?
      <div class="modal-action flex justify-center">
        <form method="dialog" on:submit|preventDefault={confirmDeleteDialog}>
          <div class="flex justify-center items-center"></div>
          <div class="flex justify-center items-center">
            <button type="submit" class="btn mr-3">Submit</button>
            <a href="/" on:click={cancelDeleteDialog}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </dialog>
</div>
