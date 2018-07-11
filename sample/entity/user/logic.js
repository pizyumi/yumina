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
