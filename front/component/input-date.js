Vue.component('input-date', {
  data: function () {
    return {
      is_errs: {},
      is_err: false,
      err_message: ''
    }
  },
  computed: {
    schema_month: function () {
      return _.extend({}, this.schema, {
        min: 1,
        max: 12,
        append: __('month')
      });
    },
    schema_day: function () {
      return _.extend({}, this.schema, {
        min: 1,
        max: 31,
        append: __('day')
      });
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
            if (v.month !== undefined && v.month !== '') {
              if (v.day === undefined || v.day === '') {
                this.is_err = true;
                this.err_message = _.template(__('incomplete_item'))({ name: s['disp_' + ext.lang] });
                return;
              }
            }
            if (v.day !== undefined && v.day !== '') {
              if (v.month === undefined || v.month === '') {
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
  created: function () {
    this.validate();
    this.$emit('updated', this.is_err);
  },
  props: ['value', 'schema', 'is_err_disp', 'is_err_parent'],
  template: `
    <div>
      <div class="my-form-row">
        <input-integer v-model="value.month" :schema="schema_month" :is_err_parent:="is_err || is_err_parent" :is_err_disp="is_err_disp" @updated="updated('month', $event)"></input-integer>
        <input-integer v-model="value.day" :schema="schema_day" :is_err_parent:="is_err || is_err_parent" :is_err_disp="is_err_disp" @updated="updated('day', $event)"></input-integer>
      </div>
      <div v-if="is_err_disp && is_err" class="control-message text-danger control-width-496">{{ err_message }}</div>
    </div>
  `
});
