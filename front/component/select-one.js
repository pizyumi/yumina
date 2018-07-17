Vue.component('select-one', {
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
  props: ['value', 'options', 'schema', 'is_err_disp', 'is_err_parent'],
  template: `
　　  <div>
        <select class="form-control control-width-256" :class="{ 'is-invalid': is_err_disp && (is_err || is_err_parent) }" :value="value" @input="$emit('input', $event.target.value)">
          <option v-for="option in options" :key="option.id" :value="option.id">{{ option.name }}</option>
        </select>
        <div v-if="is_err_disp && is_err" class="control-message text-danger">{{ err_message }}</div>
      </div>
  `
});
