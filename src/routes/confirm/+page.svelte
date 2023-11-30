<script lang="ts">
  import Header from '../../components/Header.svelte';
  import { browser } from '$app/environment';

  let isLoaded = false;
  let wrongCode = false;

  if (browser) {
    const access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 10) {
      window.location.href = '/';
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('token') || '';
    if (code !== '' && code.length > 10) {
      const url = `https://packdir.com/api/airoom/user/confirm-email?code=${code}`;
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.statusCode === 200) {
          localStorage.setItem('status', '1');
          isLoaded = true;
        } else {
          wrongCode = true;
        }
      })
    } else {
      wrongCode = true;
    }
  }

</script>


<div class="flex flex-col h-screen">
  <div class="flex">
    <Header />
  </div>

  <div class="flex justify-center px-6 py-12 lg:px-8">
    {#if isLoaded}
      Successfully! You have confirmed your email address.
    {/if}

    {#if wrongCode}
      Error! It is not a valid link.
    {/if}
  </div>

</div>
