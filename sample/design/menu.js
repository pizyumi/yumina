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
