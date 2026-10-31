// `v-slide-pill` on a `.segmented` group: injects a highlight that glides to whichever
// button carries `.is-active`, instead of the background jumping between buttons.
type PillHost = HTMLElement & { __pillCleanup?: () => void };

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('slide-pill', {
    mounted(el: PillHost) {
      const pill = document.createElement('span');
      pill.className = 'segmented-pill';
      pill.setAttribute('aria-hidden', 'true');
      el.prepend(pill);

      let placed = false;
      const update = () => {
        const active = el.querySelector<HTMLElement>(':scope > button.is-active');
        if (!active || !active.offsetWidth) {
          pill.style.opacity = '0';
          return;
        }
        pill.style.opacity = '1';
        pill.style.width = `${active.offsetWidth}px`;
        pill.style.height = `${active.offsetHeight}px`;
        pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
        if (!placed) {
          // Enable the transition only after the first placement so it doesn't fly in
          placed = true;
          requestAnimationFrame(() => pill.classList.add('segmented-pill-ready'));
        }
      };

      const mutations = new MutationObserver(update);
      mutations.observe(el, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true });
      const resizes = new ResizeObserver(update);
      resizes.observe(el);
      document.fonts?.ready.then(update);
      update();

      el.__pillCleanup = () => {
        mutations.disconnect();
        resizes.disconnect();
      };
    },
    unmounted(el: PillHost) {
      el.__pillCleanup?.();
    },
  });
});
