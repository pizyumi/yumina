Vue.component('form-item', {
  props: ['label'],
  template: `
    <div class="form-group">
      <label>{{ label }}</label>
      <slot></slot>
    </div>
  `
});
