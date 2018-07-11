var menu = {
  user: [{
    name: 'home',
    disp: 'ホーム',
    url: '/',
    active: window.location.pathname === '/'
  }, {
    name: 'rooms',
    disp: '部屋',
    url: '/rooms',
    active: window.location.pathname.indexOf('/rooms') === 0
  }, {
    name: 'plan_groups',
    disp: 'プラングループ',
    url: '/plan_groups',
    active: window.location.pathname.indexOf('/plan_groups') === 0
  }, {
    name: 'plans',
    disp: 'プラン',
    url: '/plans',
    active: window.location.pathname.indexOf('/plans') === 0
  }, {
    name: 'images',
    disp: '画像',
    url: '/images',
    active: window.location.pathname.indexOf('/images') === 0
  }, {
    name: 'user',
    disp: 'ユーザー情報',
    url: '/user',
    active: window.location.pathname.indexOf('/user') === 0
  }, {
    name: 'admin',
    disp: '管理者用ページへ',
    url: '/admin',
    active: false
  }],
  admin: [{
    name: 'home',
    disp: 'ホーム',
    url: '/admin',
    active: window.location.pathname === '/admin'
  }, {
    name: 'users',
    disp: 'ユーザー',
    url: '/admin/users',
    active: window.location.pathname.indexOf('/admin/users') === 0
  }, {
    name: 'holidays',
    disp: '祝日',
    url: '/admin/holidays',
    active: window.location.pathname.indexOf('/admin/holidays') === 0
  }, {
    name: 'tools',
    disp: 'ツール',
    url: '/admin/tools',
    active: window.location.pathname.indexOf('/admin/tools') === 0
  }]
};

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

var list_page = (name, url, logic, option) => {
  var data = _.extend({}, option.data);
  data[name] = [];
  data.columns = logic.list_schema;

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
    vm[name] = _(res.data).map((v) => logic.to_list_disp ? logic.to_list_disp(v) : v);
  }).catch((err) => {
    vm.add_err('データの読み込みに失敗しました。');
  }).finally(() => {
    vm.loaded = true;
  });

  return vm;
};

var item_page = (name, url, logic, option) => {
  var id = _(window.location.pathname.split('/')).last();

  var data = _.extend({}, option.data, { auxs: logic.auxs });
  data[name] = logic.to_item_edit_empty ? logic.to_item_edit_empty() : {};
  data.header = '';
  data.items = logic.item_schema;
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

        if (_(vm.is_errs).some((v, k) => v)) {
          vm.is_err_disp = true;
        }
        else {
          var data = logic.to_item ? logic.to_item(vm[name]) : vm[name];
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

        if (_(vm.is_errs).some((v, k) => v)) {
          vm.is_err_disp = true;
        }
        else {
          var data = logic.to_item ? logic.to_item(vm[name]) : vm[name];
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

  if (isnew) {
    vm.loaded = true;
  }
  else {
    axios.get(url + '/' + id, {}).then((res) => {
      vm[name] = logic.to_item_edit ? logic.to_item_edit(res.data) : res.data;
      vm.header = vm[name].name;
    }).catch(function (err) {
      vm.add_err('データの読み込みに失敗しました。');
    }).finally(() => {
      vm.loaded = true;
    });
  }

  return vm;
};

Vue.component('list', {
  data: function () {
    return {
      selected: {}
    };
  },
  methods: {
    select: function (id) {
      this.selected = _(this.rows).find((v) => v.id === id);
    }
  },
  props: ['columns', 'rows', 'is_update', 'is_delete'],
  template: `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.name" scope="col">{{ column.disp }}</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <template v-for="column in columns" :key="column.name">
            <th v-if="column.key" scope="row">
              <slot :name="column.id" :row="row" :column="column">{{ row[column.name] }}</slot>
            </th>
            <td v-else>
              <slot :name="column.id" :row="row" :column="column">{{ row[column.name] }}</slot>
            </td>
          </template>
          <td>
            <button v-if="is_update" type="button" class="btn btn-primary" @click="$emit('update', row.id)">変更</button>
            <button v-if="is_delete" type="button" class="btn btn-danger" data-toggle="modal" data-target="#list_delete_modal" @click="select(row.id)">削除</button>
          </td>
        </tr>
      </tbody>
      <div class="modal fade" id="list_delete_modal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <label class="modal-title">確認</label>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              「{{ selected.name }}」を削除しますか？
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" @click="$emit('delete', selected.id)">削除</button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">キャンセル</button>
            </div>
          </div>
        </div>
      </div>
    </table>
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

window.onload = () => {
  list_page('users', '/api/admin/users', user_logic, {});
};
