Vue.component('input-date-range', {
  data: function () {
    return {
      is_errs: {},
      is_err: false,
      err_message: ''
    }
  },
  methods: {
    validate: function () {
      if (_(this.is_errs).some((v, k) => v)) {
        this.is_err = true;
        this.err_message = '';
        return;
      }
      else {
        if (this.schema) {
          var s = this.schema;
          var v = this.value;
          if (!s.required) {
            if (v.start.month !== undefined && v.start.month !== '') {
              if (v.end.month === undefined || v.end.month === '') {
                this.is_err = true;
                this.err_message = _.template(__('incomplete_item'))({ name: s['disp_' + ext.lang] });
                return;
              }
            }
            if (v.end.month !== undefined && v.end.month !== '') {
              if (v.start.month === undefined || v.start.month === '') {
                this.is_err = true;
                this.err_message = _.template(__('incomplete_item'))({ name: s['disp_' + ext.lang] });
                return;
              }
            }
          }
          this.is_err = false;
          return;
        }
        else {
          this.is_err = false;
          return;
        }
      }
    },
    updated: function (control, is_err) {
      this.is_errs[control] = is_err;

      this.validate();
      this.$emit('updated', this.is_err);
    }
  },
  props: ['value', 'schema', 'is_err_disp', 'is_err_parent'],
  template: `
    <div>
      <div class="my-form-row">
        <input-date v-model="value.start" :schema="schema" :is_err_parent:="is_err || is_err_parent" :is_err_disp="is_err_disp" @updated="updated('start', $event)"></input-date>
        <span class="col-auto">～</span>
        <input-date v-model="value.end" :schema="schema" :is_err_parent:="is_err || is_err_parent" :is_err_disp="is_err_disp" @updated="updated('end', $event)"></input-date>
      </div>
      <div v-if="is_err_disp && is_err" class="control-message text-danger">{{ err_message }}</div>
    </div>
  `
});
