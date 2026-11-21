/* Fallback for browsers with container units but without CSS typed division. */
(() => {
 if (!window.CSS || !CSS.supports('container-type', 'inline-size') || CSS.supports('transform', 'scale(calc(100cqw / 1020px))')) return;
 const scene = document.querySelector('.pv-hero-scene.pv-treasury-scene');
 const artboard = scene && scene.querySelector('.pv-scene-artboard');
 if (!scene || !artboard) return;
 const resize = () => { artboard.style.transform = `scale(${scene.getBoundingClientRect().width / 1020})`; };
 document.documentElement.classList.add('pv-legacy-scale');
 resize();
 if ('ResizeObserver' in window) new ResizeObserver(resize).observe(scene);
 else window.addEventListener('resize', resize);
})();
