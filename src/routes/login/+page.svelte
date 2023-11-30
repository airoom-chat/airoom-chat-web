<script lang="ts">
  import Header from '../../components/Header.svelte';
  import { browser } from '$app/environment';

  let signupUrl = '/signup';
  let redirect = '';

  if (browser) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    redirect = urlParams.get('redirect') || '';
    if (redirect !== '') {
      signupUrl += '?redirect=' + redirect;
    }
  }

  // https://stackoverflow.com/a/24103596/3054511
  function setCookie(name: string, value: string, days: number) {
    let expires = "";
    let domain = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
      // https://stackoverflow.com/a/23086139/3054511
      domain = "; domain=airoom.chat";
    }
    document.cookie = name + "=" + (value || "")  + expires + domain + "; path=/";
  }

  function showError(errorMessage: string) {
    if (errorMessage.length < 1) {
      return;
    }

    const errorContainer = document.getElementById('errorContainer') as HTMLDivElement;
    // Clear previous error messages
    errorContainer.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 text-red-700 px-4 py-2 mb-2';
    errorDiv.textContent = errorMessage;
    errorContainer.appendChild(errorDiv);
  }

  function isValidEmail(email: string) {
    // You can add your email validation logic here
    return /\S+@\S+\.\S+/.test(email);
  }

  const login = async () => {
    const email = (document.getElementById('airoom-email') as HTMLInputElement).value;
    const password = (document.getElementById('airoom-password') as HTMLInputElement).value;

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address!');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters!');
      return;
    }

    try {
      const data = {email: email, password: password};
      const loginUrl = "https://packdir.com/api/airoom/login";
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
        }),
      });

      let apiResult = await response.json();
      if (apiResult.statusCode === 0) {
        // OK
        const access_token = apiResult.token;
        const status = apiResult.status;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('status', status);
        setCookie('access_token', access_token, 30);

        if (redirect !== '') {
          window.location.href = redirect;
        } else {
          window.location.href = '/';
        }


      //  ret.token = apiResult.token;
      //  if (apiResult.role === 1) {
      //    ret.role = 1;
      //  }
      //  return NextResponse.json(ret);
      } else {
        showError('Credentials are not correct!')
      //  ret.statusCode = 3;
      //  ret.msg = "服务器错误 1025！";
      //  return NextResponse.json(ret);
      }
    } catch (error) {
      console.log(error);
      showError('Error! 3853')
      //ret.statusCode = 2;
      //ret.msg = "服务器错误 1023！";
      //return NextResponse.json(ret);
    }
  }
</script>


<div class="flex flex-col h-screen">
  <div class="flex">
    <Header />
  </div>

  <div class="flex flex-col justify-center px-6 py-12 lg:px-8">
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" method="dialog" on:submit|preventDefault={login}>
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
          <div class="mt-2">
            <input id="airoom-email" name="email" type="email" autocomplete="email" placeholder="you@example.com"
              required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1
                              ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                              focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div class="text-sm hidden">
              <a href="/" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
          </div>
          <div class="mt-2">
            <input id="airoom-password" name="password" type="password" autocomplete="current-password" required
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
                          ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset
                          focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <div>
          <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600
                                       px-3 py-1.5 text-sm font-semibold leading-6 text-white
                                       shadow-sm hover:bg-indigo-500 focus-visible:outline
                                       focus-visible:outline-2 focus-visible:outline-offset-2
                                       focus-visible:outline-indigo-600">
            Log in
          </button>
        </div>
      </form>

      <div id="errorContainer" class="max-w-md mx-auto mt-4"></div>

      <p class="mt-10 text-center text-sm text-gray-500">
        Don't have an account?
        <a href="{signupUrl}" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Sign up</a>
      </p>
    </div>
  </div>

</div>
