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
            this.err_message = s.disp + 'を入力してください。';
            return;
          }
        }
        if (v !== undefined && v !== '') {
          if (s.length_min) {
            if (v.length < s.length_min) {
              this.is_err = true;
              this.err_message = s.disp + 'は' + s.length_min + '文字以上でなければなりません。';
              return;
            }
          }
          if (s.length_max) {
            if (v.length > s.length_max) {
              this.is_err = true;
              this.err_message = s.disp + 'は' + s.length_max + '文字以内でなければなりません。';
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

var menu = {
  user: [{
    name: 'home',
    disp: 'ホーム',
    url: '/index',
    active: window.location.pathname === '/index'
  }, {
    name: 'user',
    disp: 'ユーザー情報',
    url: '/users/<%- user_id %>',
    active: window.location.pathname.indexOf('/user') === 0
  }, {
    name: 'admin',
    disp: '管理者用ページへ',
    url: '/admin/index',
    active: false
  }],
  admin: [{
    name: 'home',
    disp: 'ホーム',
    url: '/admin/index',
    active: window.location.pathname === '/admin/index'
  }, {
    name: 'users',
    disp: 'ユーザー',
    url: '/admin/users',
    active: window.location.pathname.indexOf('/admin/users') === 0
  }]
};

var module = {};

var err_id = 0;

var data_main = {
  loaded: false,
  errs: [],
  menu: menu
};

var computed_main = {
};

var methods_main = {
  add_err: function (text) {
    this.errs.push({ id: err_id++, text: text });
  },
  delete_err: function (id) {
    this.errs = _(this.errs).reject((v) => v.id === id);
  }
};

var init = (option) => {
  return new Vue({
    el: '#main',
    data: _.extend({}, data_main, option.data),
    computed: _.extend({}, computed_main, option.computed),
    methods:  _.extend({}, methods_main, option.methods)
  });
};

var list_page = (option) => {
  var pname = ext.pname;
  var ename = ext.ename;
  var rurl = ext.rurl;

  var url = '/api' + rurl + pname;
  var logic = window[ename + '_logic'];

  var data = _.extend({}, option.data);
  data[pname] = [];
  data[pname + '_columns'] = logic.list_schema;

  var vm = init({
    data: data,
    computed: _.extend({}, option.computed),
    methods: _.extend({}, option.methods, {
      update_item: (id) => {
        window.location.href = window.location.pathname + '/' + id;
      },
      delete_item: (id) => {
        axios.post(url + '/' + id + '?action=delete').then((res) => {
          window.location.href = '';
        }).catch((err) => {
          vm.add_err('データの削除に失敗しました。');
        });
      },
      new_item: () => {
        window.location.href = '?action=new';
      }
    })
  });

  axios.get(url, {}).then((res) => {
    vm[pname] = _(res.data).map((v) => logic.to_list_disp ? logic.to_list_disp(v) : v);
  }).catch((err) => {
    vm.add_err('データの読み込みに失敗しました。');
  }).finally(() => {
    vm.loaded = true;
  });

  return vm;
};

var item_page = (option) => {
  var id = _(window.location.pathname.split('/')).last();

  var pname = ext.pname;
  var ename = ext.ename;
  var rurl = ext.rurl;

  var url = '/api' + rurl + pname;
  var logic = window[ename + '_logic'];

  var data = _.extend({}, option.data);
  data[ename] = logic.to_item_edit_empty ? logic.to_item_edit_empty() : {};
  data.header = '';
  data.items = logic.item_schema;
  data.auxs = logic.auxs;
  data.form_errs = [];
  data.is_err_disp = false;
  data.is_errs = {};

  var vm = init({
    data: data,
    computed: _.extend({}, option.computed),
    methods: _.extend({}, option.methods, {
      updated: function (control, is_err) {
        this.is_errs[control] = is_err;
      },
      update_item: () => {
        vm.form_errs = [];

        if (_(vm.is_errs).some((v) => v)) {
          vm.is_err_disp = true;
        }
        else {
          var data = logic.to_item ? logic.to_item(vm[ename]) : vm[ename];
          if (_.isError(data)) {
            vm.add_form_err(data.message);
          }
          else {
            axios.post(url + '/' + id, data).then((res) => {
              window.location.href = '';
            }).catch((err) => {
              vm.add_err('データの保存に失敗しました。');
            });
          }
        }
      },
      new_item: () => {
        vm.form_errs = [];

        if (_(vm.is_errs).some((v) => v)) {
          vm.is_err_disp = true;
        }
        else {
          var data = logic.to_item ? logic.to_item(vm[ename]) : vm[ename];
          if (_.isError(data)) {
            vm.add_form_err(data.message);
          }
          else {
            axios.post(url + '?action=new', data).then((res) => {
              window.location.href = window.location.pathname + '/' + res.data.id;
            }).catch((err) => {
              vm.add_err('データの新規作成に失敗しました。');
            });
          }
        }
      },
      add_form_err: (text) => {
        vm.form_errs.push({ id: err_id++, text: text });
      },
      delete_form_err: (id) => {
        vm.form_errs = _(vm.form_errs).reject((v) => v.id === id);
      }
    })
  });

  if (is_new) {
    vm.loaded = true;
  }
  else {
    axios.get(url + '/' + id, {}).then((res) => {
      vm[ename] = logic.to_item_edit ? logic.to_item_edit(res.data) : res.data;
      vm.header = vm[ename].name;
    }).catch(function (err) {
      vm.add_err('データの読み込みに失敗しました。');
    }).finally(() => {
      vm.loaded = true;
    });
  }

  return vm;
};

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

Vue.component('form-item', {
  props: ['label'],
  template: `
    <div class="form-group">
      <label>{{ label }}</label>
      <slot></slot>
    </div>
  `
});

var list_schema = [{
  disp: 'ID',
  name: 'id',
  key: true
}, {
  disp: '名称',
  name: 'name'
}, {
  disp: 'パスワード',
  name: 'password'
}];

var item_schema = [{
  disp: '名称',
  name: 'name',
  type: 'text',
  required: true,
  length_max: 256
}, {
  disp: 'パスワード',
  name: 'password',
  type: 'text',
  required: true,
  length_max: 256
}];

var user_logic = {
  auxs: {},
  list_schema: list_schema,
  item_schema: item_schema
};

module.exports = user_logic;

window.onload = () => item_page({});
