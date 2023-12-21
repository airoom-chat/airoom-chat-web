<script lang="ts">
  import Header from '../../components/Header.svelte';
  import { API } from '$lib/constants';

  //import { browser } from '$app/environment';
  //if (browser) {
  //  console.log('document: ', document.querySelector('h1'));
  //} else {
  //  console.log('NOT document: ')
  //}

  import { onMount } from 'svelte';
  onMount(() => {
    const redirect = '/login';

    const access_token = localStorage.getItem('access_token');
    if (!access_token || access_token.length < 20) {
      window.location.href = redirect;
    } else {
      const url = API.usage;

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
          console.log('json: ', json);
          const tbody = document.getElementById('sessions-tbody') as HTMLTableSectionElement;
          let count = 0;
          json.sessions.forEach((session: any) => {
            count++;
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = count.toString();
            tr.appendChild(th);
            const td1 = document.createElement('td');
            td1.textContent = session.topic;
            tr.appendChild(td1);
            const td2 = document.createElement('td');
            // 
            const f = Math.round(session.fee / 100000) / 100;
            td2.textContent = '$' + f;
            tr.appendChild(td2);
            const td3 = document.createElement('td');
            td3.textContent = session.updated_at;
            tr.appendChild(td3);
            tbody.appendChild(tr);
          });

          // balance
          const balance = document.getElementById('balance') as HTMLDivElement;
          const b = Math.round(json.balance / 100000 + 0.5) / 100;
          balance.textContent = '$' + b;
        }
      });
    }
  });

</script>

<div class="flex flex-col h-screen">
  <div class="flex">
    <Header />
  </div>

  <div class="flex-1">
    <div class="grid grid-cols-5 gap-4 overflow-x-auto">
      <div class="col-span-4">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th>Session</th>
              <th>Spend</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody id="sessions-tbody">
          </tbody>
        </table>
      </div>
      <div class="col-span-1">
        <div id="balance" class="col-sp">
        </div>
        <div class="mt-10 flex items-center gap-x-4">
        </div>
      </div>
    </div>

  </div>
</div>
