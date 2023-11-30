<script lang="ts">
  import { loader } from '../../components/loader';
  import { writable } from 'svelte/store';
  import Header from '../../components/Header.svelte';
  import { API } from '$lib/constants';
  import ModalConfirmEmail from '../../components/ModalConfirmEmail.svelte';

  let selectedRoomUuid = '';

  let loading = writable(true);

  let isLoaded = false;
  let isConfirmed = false; // Is email confirmed?
  let modelName = '';
  let description = '';
  let input_fee = 0.0;
  let output_fee = 0.0;
  let context_window = '';
  let updated_at = '';

  import { browser } from '$app/environment';
  let mid = '';
  if (browser) {
    // Status
    const status = localStorage.getItem('status') || '';
    if (status === '1') {
      isConfirmed = true;
    }
    // tmp
    isConfirmed = true;

    // Get URL parameter mid.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    mid = urlParams.get('mid') || '';
    if (!mid) {
      window.location.href = '/';
    }

    const redirect = '/login?redirect=/model?mid=' + mid;

    const access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 20) {
      window.location.href = redirect;
    } else {
      const url = API.model + '?uuid=' + mid;

      fetch(url, {
        headers:
        {
          Authorization: `Bearer ${access_token}`,
        }
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.statusCode === 401) {
            // unauthorized
            window.location.href = redirect;
          } else {
            console.log('model: ', json);
            modelName = json.model.name;
            if (modelName === 'gpt-3.5-turbo-16k') {
              description = 'GPT-3.5-turbo-16k model can understand and generate natural language or code. It has been optimized for chat using the Chat Completions API but works well for traditional completions tasks as well.';
              input_fee = 0.0015;
              output_fee = 0.003;
              context_window = '16k tokens';
              updated_at = '2021-09';
            } else {
              description = 'GPT-4-1106-preview is a large multimodal model (accepting text or image inputs and outputting text) that can solve difficult problems with greater accuracy than any of our previous models, thanks to its broader general knowledge and advanced reasoning capabilities.'
              input_fee = 0.015;
              output_fee = 0.045;
              context_window = '128k tokens';
              updated_at = '2023-04';
            }

            // todo: remove it.
            if (json.rooms.length > 0) {
              selectedRoomUuid = json.rooms[0].uuid;
            }

            isLoaded = true;
          }
          loading.set(false);
        })
        .catch((err) => {
          console.log(err);
          loading.set(false);
        });
    }
  }

  function popupConfirm() {
    const access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 20) {
      window.location.href = '/login';
      return;
    }

    fetch (API.user, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      }
    })
    .then((res) => res.json())
    .then((json) => {
      if (json.statusCode === 401) {
        // unauthorized
        window.location.href = '/login';
      } else {
        console.log(json);
        if (json.status === 1) {
          // Already confirmed.
          localStorage.setItem('status', '1');
          isConfirmed = true;
          return;
        }

        // Not confirmed yet.
        const modal = document.getElementById('modal_confirm_email') as HTMLDialogElement;
        const email = modal.querySelector('#my-email') as HTMLDivElement;
        email.innerHTML = json.email;
        if (modal) {
          modal.showModal();
        } else {
          console.error('Error! modal_confirm_email not found');
        }

      }
    });
  }

  function gotoRoom() {
    // todo: remove it.
    if (selectedRoomUuid.length > 10) {
      // Choose an existing room.
      window.location.href = `/r?rid=${selectedRoomUuid}`;
    } else {
      // Create a new room.
      const access_token = localStorage.getItem('access_token');
      if (!access_token || access_token.length < 20) {
        window.location.href = '/login';
        return;
      }

      fetch(API.room, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          botUuid: mid,
          roomName: 'Untitled',
        }),
      })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        if (json.statusCode === 401) {
          // unauthorized
          window.location.href = '/login';
        }
        loading.set(false);
        window.location.href = `/r?rid=${json.room_uuid}`;
      })
      .catch((err) => {
        console.log(err);
        loading.set(false);
      });
    }
    return

    const radio = document.querySelector('input[type = radio]:checked') as HTMLInputElement;
    if (radio === null) {
      return;
    }

    let roomUuid = radio.value;
    console.log('existingRoomUuid: ', roomUuid)

  }

</script>


<div class="flex flex-col h-screen" use:loader={loading}>
  <div class="flex">
    <Header />
  </div>

  <div class="flex-1 mt-8">
    {#if isLoaded}
      <h1 class="flex justify-center mb-6 text-2xl leading-none tracking-tight">{modelName}</h1>
      <div class="px-10 md:px-56 lg:px-64">
        <div class="my-2 mb-5">{description}</div>
        <div class="my-1">
          <span class="font-medium">
            Input: 
          </span>
          ${input_fee} / 1k tokens
        </div>
        <div class="my-1">
          <span class="font-medium">
            Output: 
          </span>
          ${output_fee} / 1k tokens
        </div>
        <div class="my-1">
          <span class="font-medium">
            Context window: 
          </span>
          {context_window}
        </div>
        <div class="my-1">
          <span class="font-medium">
            Data updated at: 
          </span>
          {updated_at}
        </div>

        <div class="hidden">
        <input type="radio" id="html" name="airoom" value="HTML">
        <label for="html">HTML</label><br>
        <input type="radio" id="css" name="airoom" value="CSS">
        <label for="css">CSS</label><br>

        <input type="radio" id="airoom-new" name="airoom" value="new" checked>
        <label for="airoom-new">Create a new room with the model.</label>
        </div>

        <div class="flex justify-center mt-8">
          {#if isConfirmed}
            <button on:click={gotoRoom} class="btn btn-success flex justify-center items-center">
              Chat
            </button>
          {:else}
            <div id="tosend">
              You have NOT confirmed your email address. Please click the 
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a href="#" on:click={popupConfirm} class="font-medium underline"> link </a>
              to send a confirmation email.
            </div>
            <div id="hassent" class="hidden">
              A confirmation email has been sent to your email address. Please click the link in the email to confirm your email address.
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <ModalConfirmEmail />
</div>
