var list_schema = [{
  disp_en: 'ID',
  disp_ja: 'ID',
  name: 'id',
  key: true
}, {
  disp_en: 'name',
  disp_ja: '名称',
  name: 'name'
}, {
  disp_en: 'password',
  disp_ja: 'パスワード',
  name: 'password'
}];

var item_schema = [{
  disp_en: 'name',
  disp_ja: '名称',
  name: 'name',
  type: 'text',
  required: true,
  length_max: 256
}, {
  disp_en: 'password',
  disp_ja: 'パスワード',
  name: 'password',
  type: 'text',
  required: true,
  length_max: 256
}];

var user_logic = {
  list_schema: list_schema,
  item_schema: item_schema
};

module.exports = user_logic;
