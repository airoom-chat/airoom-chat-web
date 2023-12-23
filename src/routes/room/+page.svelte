<script lang="ts">
  import Header from '../../components/Header.svelte';
  import Room from '../../components/Room.svelte';

  import { onMount } from 'svelte';
  onMount(() => {
    const setHeight = () => {
      const chatBoxHeight = window.innerHeight - 66 - 50 - 26 - 38;
      const msgbox = document.getElementById('msgbox');
      if (msgbox) {
        msgbox.style.height = `${chatBoxHeight}px`;
      }
    }

    setHeight();

    addEventListener('resize', (evt) => {
      setHeight();
    })
  })

</script>

  <div class="flex flex-col h-screen">
    <div class="flex">
      <Header />
    </div>

    <div class="flex-1">
      <Room />
    </div>
  </div>
