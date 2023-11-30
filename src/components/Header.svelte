<script lang="ts">
  // https://stackoverflow.com/a/24103596/3054511
  function eraseCookie(name: string) {
    document.cookie = name +'=; domain=airoom.chat; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  import { page } from '$app/stores';
  let isRoom = false;
  page.subscribe(value => {
    if (value.route.id === '/r') {
      isRoom = true;
    }
  });

  function openit() {
    const checkbox = document.getElementById('room-sidebar-drawer') as HTMLInputElement;
    checkbox.checked = checkbox.checked ? false : true;
  }
      //{#if isRoom}
      //  <label for="my-drawer-4" class="drawer-button btn btn-primary" on:click={openit}>Open drawer</label>
      //{/if}

  import { browser } from '$app/environment';

  let authenticated = false;
  if (browser) {
    const access_token = localStorage.getItem('access_token');
    if (access_token && access_token.length > 5) {
      authenticated = true;
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token');
    eraseCookie('access_token');
    window.location.href = '/';
  }
          //<a href="/" class="btn btn-ghost rounded-btn">Button</a>
</script>


  <div class="navbar bg-base-100 border-b-2">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost normal-case text-xl gap-[0.1rem]
                         hover:bg-transparent">
        <span class="text-red-500 italic">ai</span>room.chat
      </a>
    </div>

    <div id="userinfo-wrapper" class="flex-none">
      {#if authenticated}
        <div class="flex items-stretch">
          <div class="dropdown dropdown-end pr-2">
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label tabindex="0">
              <img src="/images/user.png" class="w-7 h-7" alt="avatar" />
            </label>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <ul tabindex="0" class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-lg w-40 mt-5">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
              <li on:click={logout}>Log out</li> 
            </ul>
          </div>
        </div>
      {:else}
        <a class="btn btn-ghost btn-sm capitalize" href="/login">Login</a>
      {/if}
    </div>
  </div>
