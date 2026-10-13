/** @file Custom buttons backed by Cesium's native Globe, 2D and Columbus views. */

/**
 * Wire view buttons to Cesium scene morph methods, with instantaneous transitions
 * so drawing/dragging cannot begin halfway through a camera transformation.
 * The owner retains all shapes and selection; this module only changes the view.
 * @param {Object} options Scene/DOM boundary and safe edit lifecycle callbacks.
 * @returns {()=>void} Refresh pressed/disabled states from the actual Cesium mode.
 */
export function bindViewControls({ scene, modes, buttons, beforeChange, afterChange, notify }) {
  const entries = [
    { button: buttons.globe, mode: modes.SCENE3D, method: 'morphTo3D' },
    { button: buttons.flat, mode: modes.SCENE2D, method: 'morphTo2D' },
    { button: buttons.tilted, mode: modes.COLUMBUS_VIEW, method: 'morphToColumbusView' },
  ];
  const refresh = () => {
    for (const { button, mode } of entries) {
      button.disabled = scene.mode === modes.MORPHING;
      button.setAttribute('aria-pressed', String(scene.mode === mode));
      button.classList.toggle('active', scene.mode === mode);
    }
  };
  for (const { button, mode, method } of entries)
    button.addEventListener('click', () => {
      if (scene.mode === mode || scene.mode === modes.MORPHING) return;
      if (beforeChange() === false) return;
      try {
        scene[method](0);
        scene.requestRender();
      } catch (error) {
        notify(`Could not change view: ${error.message}`);
      }
      refresh();
    });
  scene.morphStart.addEventListener(refresh);
  scene.morphComplete.addEventListener(() => {
    refresh();
    afterChange();
  });
  refresh();
  return refresh;
}
