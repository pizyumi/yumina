Vue.component('input-text', {
  data: function () {
    return {
      is_err: false,
      err_message: ''
    };
  },
  methods: {
    validate: function () {
      if (this.schema) {
        var s = this.schema;
        var v = this.value;
        if (s.required) {
          if (v === undefined || v === '') {
            this.is_err = true;
            this.err_message = _.template(__('empty_item'))({ name: s.disp });
            return;
          }
        }
        if (v !== undefined && v !== '') {
          if (s.length_min) {
            if (v.length < s.length_min) {
              this.is_err = true;
              this.err_message = _.template(__('too_short_item'))({ name: s.disp, min: s.length_min });
              return;
            }
          }
          if (s.length_max) {
            if (v.length > s.length_max) {
              this.is_err = true;
              this.err_message = _.template(__('too_long_item'))({ name: s.disp, max: s.length_max });
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
  watch: {
    value: function () {
      this.validate();
      this.$emit('updated', this.is_err);
    }
  },
  created: function () {
    this.validate();
    this.$emit('updated', this.is_err);
  },
  props: ['value', 'schema', 'is_err_disp', 'is_err_parent'],
  template: `
    <div>
      <input type="text" class="form-control control-width-1024" :class="{ 'is-invalid': is_err_disp && (is_err || is_err_parent) }" :value="value" @input="$emit('input', $event.target.value)">
      <div v-if="is_err_disp && is_err" class="control-message text-danger">{{ err_message }}</div>
    </div>
  `
});
