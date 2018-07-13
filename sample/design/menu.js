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
