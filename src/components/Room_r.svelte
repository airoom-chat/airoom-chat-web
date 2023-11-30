
<script lang="ts">
  import { loader } from './loader';
  import { writable } from 'svelte/store';
  import { getRoom_R } from '$lib/accessRoom_r';
  import RoomDialogBox from './RoomDialogBox_r.svelte';
  import RoomSide from './RoomSide_r.svelte';
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
    const searchParams = new URLSearchParams(window.location.search);
    const room_uuid_r = searchParams.get('rid') || '';
    const session_uuid_r = searchParams.get('sid') || '';

    //const refreshHash = (url: string) => {
    //  window.location.hash = url;
    //}

    const showConversation = (session: any) => {
      let topic = session.topic === '' ? 'Untitled' : session.topic;
      const uid = session.user_uuid;
      const rid = session.room_uuid;
      const sid = session.uuid;
      const url = `/r?uid=${uid}&rid=${rid}&sid=${sid}`;
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
      div.className = 'conversation-item border-t-2 ';
      div.innerHTML = `
        <a href="${url}" class="conversation-link">
          <div class="conversation-topic">
            ${topic}
          </div>
          <div class="conversation-time">
            ${time}
          </div>
        </a>
      `;
      const alink = div.querySelector('a');
      if (alink) {
        alink.addEventListener('click', (e) => {
          window.location.href = url;
        //  //refreshHash(url);
        }, false);
      }
      wrap.appendChild(div);
    }

    getRoom_R({room_uuid_r, session_uuid_r}).then((room: any) => {
      loading.update(n => false);
      if (!room) {
        console.error('Error! room is null');
        return;
      }

      roomName = room.room_name;
      botName = room.bot_name || 'gpt-3.5-turbo';

      // Show conversations on sidebar
      for (let i=0; i < room.sessions.length; i++) {
        showConversation(room.sessions[i]);
      }

      // Update the current session.
      // Save user_uuid, room_uuid and session_uuid to localStorage
      if (room.sessions.length > 0 && room_uuid_r && session_uuid_r) {
        localStorage.setItem('room_uuid_r', room_uuid_r);
        localStorage.setItem('session_uuid_r', session_uuid_r);
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
      }

      scrollToBottom();

      // focus on textarea
      const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
      textarea.focus();
    });
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
</div>
