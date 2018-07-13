var menu = {
  user: [{
    name: 'home',
    disp_en: 'home',
    disp_ja: 'ホーム',
    url: '/index',
    active: window.location.pathname === '/index'
  }, {
    name: 'user',
    disp_en: 'user info',
    disp_ja: 'ユーザー情報',
    url: '/users/<%- user_id %>',
    active: window.location.pathname.indexOf('/user') === 0
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
    url: '/admin/index',
    active: window.location.pathname === '/admin/index'
  }, {
    name: 'users',
    disp_en: 'users',
    disp_ja: 'ユーザー',
    url: '/admin/users',
    active: window.location.pathname.indexOf('/admin/users') === 0
  }]
};
