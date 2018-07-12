Vue.component('entity', {
  props: ['data', 'items', 'auxs', 'is_err_disp', 'updated'],
  template: `
    <form>
      <form-item v-for="item in items" :label="item.disp">
        <input-text v-if="item.type === 'text'" v-model="data[item.name]" :schema="item" :is_err_disp="is_err_disp" @updated="updated(item.name, $event)"></input-text>
        <input-integer v-else-if="item.type === 'integer'" v-model="data[item.name]" :schema="item" :is_err_disp="is_err_disp" @updated="updated(item.name, $event)"></input-integer>
        <select-one v-else-if="item.type === 'select'" v-model="data[item.name]" :options="auxs[item.options]" :schema="item" @updated="updated(item.name, $event)"></select-one>
        <input-integer-range v-else-if="item.type === 'integer-range'" v-model="data[item.name]" :schema="item" :is_err_disp="is_err_disp"  @updated="updated(item.name, $event)"></input-integer-range>
        <input-date-range v-else-if="item.type === 'date-range'" v-model="data[item.name]" :schema="item" :is_err_disp="is_err_disp" @updated="updated(item.name, $event)"></input-date-range>
      </form-item>
    </form>
  `
});
