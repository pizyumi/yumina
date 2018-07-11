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
