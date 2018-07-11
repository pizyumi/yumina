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
