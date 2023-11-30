<script lang="ts">
  import { getFingerprint } from '$lib/fingerprint';
  import { API_ANONYMOUS } from '$lib/constants';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  async function create_room() {
    // Spinner
    dispatch('spinning', true);

    // Room name
    let room_name = (document.getElementById('input_room_name') as HTMLInputElement).value;
    if (!room_name || (room_name.trim()).length < 1) {
      room_name = 'Untitled'
    }

    const modal = document.getElementById('modal_new_room') as HTMLDialogElement;
    modal.close();

    const url = API_ANONYMOUS.room;
    let user_uuid = localStorage.getItem('user_uuid');
    if (!user_uuid || user_uuid.length < 5) {
      user_uuid = await getFingerprint();
      localStorage.setItem('user_uuid', user_uuid);
    }

    const roomData = {
      user_uuid,
      room_name,
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    })
    .then(response => response.json())
    .then(data => {
      if (!data.user_uuid || data.user_uuid.length < 5 ||
          !data.room_uuid || data.room_uuid.length < 5
      ) {
        console.log('create_room: error')
        dispatch('spinning', false);
        return;
      } else {
        localStorage.setItem('user_uuid', data.user_uuid);
        localStorage.setItem('room_uuid', data.room_uuid);
        localStorage.setItem('session_uuid', data.session_uuid);
        dispatch('spinning', false);
        window.location.href = `/room?uid=${data.user_uuid}&rid=${data.room_uuid}&sid=${data.session_uuid}`
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      dispatch('spinning', false);
    });
  }

  function cancel_modal() {
    const modal = document.getElementById('modal_new_room') as HTMLDialogElement;
    modal.close();
  }
</script>

<dialog id="modal_new_room" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Create a chat room</h3>
    <div class="modal-action flex justify-center">
      <form method="dialog" on:submit|preventDefault={create_room}>
        <div class="flex justify-center items-center">
          <input id="input_room_name" type="input" placeholder="Room name" class="input input-bordered " />
        </div>
        <div class="flex justify-center items-center mt-4">
          <button type="submit" class="btn mr-3">Submit</button>
          <a href="/" on:click={cancel_modal}>Cancel</a>
        </div>
      </form>
    </div>
  </div>
</dialog>
