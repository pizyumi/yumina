Vue.component('input-integer', {
  data: function () {
    return {
      is_err: false,
      err_message: ''
    };
  },
  computed: {
    min: function () {
      return this.schema ? this.schema.min : undefined;
    },
    max: function () {
      return this.schema ? this.schema.max : undefined;
    },
    prepend: function () {
      return this.schema ? this.schema.prepend : undefined;
    },
    append: function () {
      if (this.schema) {
        var s = this.schema;
        if (s.append) {
          return s.append;
        }
        else if (s['unit_disp_' + ext.lang]) {
          return s['unit_disp_' + ext.lang];
        }
        else {
          return undefined;
        }
      }
      else {
        return undefined;
      }
    }
  },
  methods: {
    check_key: function (ev) {
      if (ev.key === '.' || ev.key === '+' || ev.key === '-' || ev.key === 'e' || ev.key === 'E') {
        ev.preventDefault();
      }
    },
    validate: function () {
      if (this.schema) {
        var s = this.schema;
        var v = this.value;
        if (s.required) {
          if (v === undefined || v === '') {
            this.is_err = true;
            this.err_message = _.template(__('empty_item'))({ name: s['disp_' + ext.lang] });
            return;
          }
        }
        if (v !== undefined && v !== '') {
          if (s.min) {
            if (v < s.min) {
              this.is_err = true;
              this.err_message = _.template(__('too_small_item'))({ name: s['disp_' + ext.lang], min: s.min, unit: s['unit_disp_' + ext.lang] ? s['unit_disp_' + ext.lang] : '' });
              return;
            }
          }
          if (s.max) {
            if (v > s.max) {
              this.is_err = true;
              this.err_message = _.template(__('too_large_item'))({ name: s['disp_' + ext.lang], min: s.min, unit: s['unit_disp_' + ext.lang] ? s['unit_disp_' + ext.lang] : '' });
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
      <div class="input-group control-width-256">
        <div v-if="prepend" class="input-group-prepend">
          <span class="input-group-text">{{ prepend }}</span>
        </div>
        <input type="number" class="form-control" :class="{ 'is-invalid': is_err_disp && (is_err || is_err_parent) }" :min="min" :max="max" :value="value" @input="$emit('input', $event.target.value)" @keypress="check_key">
        <div v-if="append" class="input-group-append">
          <span class="input-group-text">{{ append }}</span>
        </div>
      </div>
      <div v-if="is_err_disp && is_err" class="control-message text-danger">{{ err_message }}</div>
    </div>
  `
});
