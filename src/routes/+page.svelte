<script lang="ts">
  import { getFingerprint } from '$lib/fingerprint';
  import { API, API_ANONYMOUS } from '$lib/constants';
  import { browser } from '$app/environment';
//  import { bots } from '../stores.js';

  // User fingerprint
  async function get_user_uuid() {
    let user_uuid = localStorage.getItem('user_uuid');
    if (!user_uuid || user_uuid.length < 5) {
      user_uuid = await getFingerprint();
      localStorage.setItem('user_uuid', user_uuid);
    }
    return user_uuid;
  }

  // Room uuid
  function get_room_uuid() {
    let room = localStorage.getItem('room_uuid');
    let room_uuid = '';
    if (room && room.length && room.length > 5) {
      room_uuid = room;
    }
    return room_uuid;
  }

  // Session uuid
  function get_session_uuid() {
    let session = localStorage.getItem('session_uuid');
    let session_uuid = '';
    if (session && session.length && session.length > 5) {
      session_uuid = session;
    }
    return session_uuid;
  }

  // Access token
  function get_access_token() {
    let access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 15) {
      access_token = '';
    }
    return access_token;
  }

  // Rooms
  function populate_rooms(rooms: any) {
    const rooms_wrap = document.getElementById('rooms-wrap') as HTMLDivElement;

    rooms.forEach((room: any) => {
      const room_div = document.createElement('a') as HTMLAnchorElement;
      room_div.href = room.url;
      room_div.classList.add(
        'room-wrap', 'border', 'border-gray-300', 'rounded-lg', 'p-4', 'shadow-md',
        'hover:bg-gray-200', 'transition', 'duration-300', 'ease-in-out', 'cursor-pointer',
        'h-28'
      );
      room_div.innerHTML = `
        <div class="room-header flex items-center justify-between">
          <div class="room-avatar w-6">
            <img src="${room.avatar}" alt="${room.name}" />
          </div>
          <div class="room-name">${room.name}</div>
        </div>
        <div class="room-body mt-5 flex justify-center">
          <div class="room-updated-at">${room.updated_at}</div>
        </div>
      `;
      rooms_wrap.querySelector('.placeholder-div')?.replaceWith(room_div);
      //rooms_wrap.appendChild(room_div);
    });

    // Remove other placeholder blocks
    const placeholder_divs = rooms_wrap.querySelectorAll('.placeholder-div');
    placeholder_divs.forEach((div) => {
      div.remove();
    });
  }

  // LLMs
  function populate_bots(llms: any) {
    const llms_wrap = document.getElementById('llms-wrap') as HTMLDivElement;

    let published_at = '2021-09';

    llms.forEach((llm: any) => {
      if (llm.name === 'gpt-4-1106-preview') {
        published_at = '2023-04';
      } else if (llm.name === 'gpt-3.5-turbo-16k') {
        published_at = '2021-09';
      } else {
        published_at = '2023-11';
      }
      const llm_div = document.createElement('a') as HTMLAnchorElement;
      llm_div.href = `/b?id=${llm.uuid}`;
      llm_div.classList.add(
        'llm-wrap', 'border', 'border-gray-300', 'rounded-lg', 'p-4', 'shadow-md',
        'hover:bg-gray-200', 'transition', 'duration-300', 'ease-in-out', 'cursor-pointer'
      );
      llm_div.innerHTML = `
        <div class="llm-header flex items-center justify-between">
          <div class="llm-avatar w-6">
            <img src="${llm.avatar}" alt="${llm.name}" />
          </div>
          <div class="llm-name">${llm.name}</div>
        </div>
        <div class="llm-body mt-4">
          <div class="llm-vender">AIRoom</div>
          <div class="llm-published-at">${published_at}</div>
        </div>
      `;
      llms_wrap.appendChild(llm_div);
    });
  }


  import { onMount } from 'svelte';
  onMount(async () => {
    // Public bots
    try {
      const publicBots = await fetch(API_ANONYMOUS.bots);
      const botsData = await publicBots.json();
      if (botsData && botsData.bots && botsData.bots.length > 0) {
        populate_bots(botsData.bots);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    let data = {
      rooms: [
        {
          name: 'gpt-3.5-turbo',
          url: '',
          avatar: '/images/playground.png',
          updated_at: 'Playground',
        }
      ],
      assistants: [],
      llms: [
        {
          uuid: '87Xacu8D07CL',
          name: 'gpt-3.5-turbo-16k',
          vender: 'OpenAI',
          avatar: '/images/gpt.svg',
          published_at: '2021-09',
        },
        {
          uuid: '87Xacu8D07C2',
          name: 'gpt-4-1106-preview',
          vender: 'OpenAI',
          avatar: '/images/gpt.svg',
          published_at: '2023-04',
        },
      ]
    }

    try {
      // Get playground rooms for the browser.
      const user_uuid = await get_user_uuid();
      const playgrounds = await fetch(`${API_ANONYMOUS.room}?user_uuid=${user_uuid}`)
      const pgs = await playgrounds.json()
      for (let i = 0; i < pgs.rooms.length; i++) {
        pgs.rooms[i]['url'] = `/room?uid=${user_uuid}&rid=${pgs.rooms[i].uuid}`
        pgs.rooms[i]['avatar'] = '/images/playground.png'
        pgs.rooms[i]['updated_at'] = pgs.rooms[i].bot_name
      }
      populate_rooms(pgs.rooms);
    } catch (error) {
      console.error('Error:', error);
    }

    /* abandoned
    try {
      const user_uuid = await get_user_uuid();
      const room_uuid = get_room_uuid();
      const session_uuid = get_session_uuid();
      const access_token = get_access_token();

      // Default room
      if (room_uuid === '') {
        const roomData = {
          user_uuid,
          room_name: 'Playground',
        }
        fetch(API_ANONYMOUS.room, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roomData),
        })
        .then(response => response.json())
        .then(data9 => {
          console.log('Success 1919:', data);
          if (!data9.user_uuid || data9.user_uuid.length < 5 ||
              !data9.room_uuid || data9.room_uuid.length < 5
          ) {
            console.log('create_room: error')
          } else {
            localStorage.setItem('user_uuid', data9.user_uuid);
            localStorage.setItem('room_uuid', data9.room_uuid);
            localStorage.setItem('session_uuid', data9.session_uuid);
            data.rooms[0].url = `/room?uid=${data9.user_uuid}&rid=${data9.room_uuid}&sid=${data9.session_uuid}`
            populate_rooms(data.rooms);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      } else {
        let urlDefaultRoom = `/room?uid=${user_uuid}&rid=${room_uuid}`;
        if (session_uuid !== '') {
          urlDefaultRoom += `&sid=${session_uuid}`;
        }
        data.rooms[0].url = urlDefaultRoom;

        populate_rooms(data.rooms);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    */
  })

  import ModalNewRoom from '../components/ModalNewRoom.svelte';
  import Header from '../components/Header.svelte';
  import Footer from '../components/Footer.svelte';

  // spinner
  import { loader } from '../components/loader';
  import { writable } from 'svelte/store';
  let loading = writable(false);

  /**
   * @param {{ detail: boolean; }} event
   */
  function spinningHandler(event: CustomEvent<boolean>) {
    loading.update(n => event.detail);
  }

  const modal_new_room = async () => {
    const modal = document.getElementById('modal_new_room') as HTMLDialogElement;

    // User uuid, room uuid, session uuid
    const user = localStorage.getItem('user_uuid');
    const room = localStorage.getItem('room_uuid');
    const session = localStorage.getItem('session_uuid');

    if (room === null || room === 'undefined' || !room.length || room.length < 5 ||
        user === null || user === 'undefined' || !user.length || user.length < 5
    ) {
      console.log('NEED TO CREATE A NEW ROOM')
      modal.showModal();
    } else {
      if (session === null || session === 'undefined' || !session.length || session.length < 5) {
        window.location.href = `/r?rid=${room}&sid={session}`
      } else {
        window.location.href = `/r?rid=${room}`
      }
    }
  }

  // Calculate the number of pre-load placeholder blocks.
  let blockNum = 2;
  let blockArray = [] as number[];
  if (browser) {
    const lg = 1024;
    const md = 768;
    const win_width = window.innerWidth;
    if (win_width >= lg) {
      blockNum = 4;
    } else if (win_width >= md) {
      blockNum = 3;
    }

    // LLM placeholder blocks
    for (let i = 0; i < blockNum; i++) {
      blockArray.push(i);
    }
  }

</script>

<div class="outside-all flex flex-col min-h-screen">

  <Header />

  <div class="main-content py-2 px-7 md:px-20 lg:px-24" use:loader={loading}>
    <div class="section">
      <div class="flex justify-between mt-8 mb-5 border-b">
        <h2 class="text-2xl font-bold text-gray-800">Rooms</h2>
        <div class="new-room hidden">
          <button class="btn btn-primary" on:click={modal_new_room}>New Room</button>
        </div>
      </div>
      <div id="rooms-wrap" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each blockArray as _, i}
        <div class="placeholder-div h-28 border border-gray-300 rounded-lg shadow-md">
          <div class="llm-header flex items-center justify-center h-28">
            <div class="llm-avatar w-6 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
          </div>
        </div>
        {/each}
      </div>
    </div>
    <div class="section">
      <div class="mt-8 mb-5 border-b">
        <h2 class="text-2xl font-bold text-gray-800">AIs</h2>
      </div>
      <div id="llms-wrap" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each blockArray as _, i}
        <div class="hidden">
          <div class="llm-header flex items-center justify-between">
            <div class="llm-avatar w-6">
              <img src="/images/gpt.svg" alt="gpt" />
            </div>
            <div class="llm-name"></div>
          </div>
          <div class="llm-body">
            <div class="llm-vender"></div>
            <div class="llm-published-at"></div>
          </div>
        </div>
        {/each}
      </div>
    </div>
  </div>

  <ModalNewRoom on:spinning={spinningHandler} />

  <Footer />
</div>
