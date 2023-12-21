<script lang="ts">
  import RoomMessageTextarea from './RoomMessageTextarea_r.svelte';
  import { roominfo } from '../stores';

  let b_type = 0;
  roominfo.subscribe((value) => {
    if (value) {
      const { bot_type } = value;
      b_type = bot_type;
    }
  });
</script>

<div class="h-full">
  <div id="msgbox" class="chats overflow-y-auto">
    <div class="msg-page pb-12">
      <div class="received-chats flex justify-center my-3 font-light">
        {#if b_type === 0}
          --- Conversation starts ---
        {:else}
          --- GPT消息生成可能耗时较长，请耐心等待 ---
        {/if}
      </div>
    </div>
  </div>

  <RoomMessageTextarea />
</div>
