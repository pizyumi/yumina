module.exports = (d, db, common) => {
  return {
    user_by_name: async (name) => {
      return await common.select_one_by_sql(db, 'select * from t_user where name=@name and delete_date is null', { name });
    }
  }
};
