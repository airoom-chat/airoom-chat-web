<script>
  import "../app.css";
  import { updated } from "$app/stores";
</script>

<div class="app" data-sveltekit-reload={$updated ? "" : "off"}>
  <slot />
</div>
