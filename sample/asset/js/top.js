var menu = {
  user: [{
    name: 'home',
    disp_en: 'home',
    disp_ja: 'ホーム',
    url: '/index'
  }, {
    name: 'user',
    disp_en: 'user info',
    disp_ja: 'ユーザー情報',
    url: '/users/<%- user_id %>'
  }, {
    name: 'admin',
    disp_en: 'admin',
    disp_ja: '管理者用ページへ',
    url: '/admin/index',
    active: false
  }],
  admin: [{
    name: 'home',
    disp_en: 'home',
    disp_ja: 'ホーム',
    url: '/admin/index'
  }, {
    name: 'users',
    disp_en: 'users',
    disp_ja: 'ユーザー',
    url: '/admin/users'
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
          vm.add_err(__('failed_delete'));
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
    vm.add_err(__('failed_load'));
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
  data.auxs = logic.auxs ? logic.auxs : {};
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
              vm.add_err(__('failed_save'));
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
              vm.add_err(__('failed_new'));
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
      vm.add_err(__('failed_load'));
    }).finally(() => {
      vm.loaded = true;
    });
  }

  return vm;
};

window.onload = () => {
  var vm = init({});

  vm.loaded = true;
};
