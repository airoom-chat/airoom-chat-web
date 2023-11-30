<script lang="ts">
  import RoomMessageTextarea from './RoomMessageTextarea.svelte';
</script>

<div class="h-full">
  <div id="msgbox" class="chats overflow-y-auto">
    <div class="msg-page pb-12">
      <div class="received-chats flex justify-center my-3 font-light">
        --- Conversation starts ---
      </div>
    </div>
  </div>

  <RoomMessageTextarea />
</div>
