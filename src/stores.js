import { writable } from 'svelte/store';

// All available bots
//export const bots = writable([]);

// Room info
export const roominfo = writable({
  rid: '',
  sid: '',
  bot_type: 0,
});
