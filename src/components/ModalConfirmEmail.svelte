<script lang="ts">
  import { API } from '$lib/constants';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  async function sendemail() {
    // Spinner
    dispatch('spinning', true);

    const access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 20) {
      window.location.href = '/login';
      return;
    }

    const url = API.confirm_email;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      cancel_modal();

      const tosend = document.getElementById('tosend') as HTMLDivElement;
      tosend.classList.add('hidden');
      const hassent = document.getElementById('hassent') as HTMLDivElement;
      hassent.classList.remove('hidden');
    })
    .catch((error) => {
      console.error('Error:', error);
      dispatch('spinning', false);
    });
  }

  function cancel_modal() {
    const modal = document.getElementById('modal_confirm_email') as HTMLDialogElement;
    modal.close();
  }
</script>

<dialog id="modal_confirm_email" class="modal">
  <div class="modal-box">
    <div class="modal-action flex justify-center">
      <form method="dialog" on:submit|preventDefault={sendemail}>
        <div>
          Are you sure to send a confirmation email to <span class="font-medium" id="my-email"></span>?
        </div>
        <div class="flex justify-center items-center mt-4">
          <button type="submit" class="btn mr-3">Yes</button>
          <button type="button" on:click={cancel_modal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
</dialog>
