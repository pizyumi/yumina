var _ = require('underscore');
var bluebird = require('bluebird');
var bodyparser = require('body-parser');
var co = require('co');
var connectflash = require('connect-flash');
var connectredis = require('connect-redis');
var express = require('express');
var expresssession = require('express-session');
var i18n = require('i18n');
var morgan = require('morgan');
var passport = require('passport');
var passportlocal = require('passport-local');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');

var scommon = {};

scommon = _.extend(scommon, {
  handle_ids_parameter: (req) => {
    if (req.params.ids) {
      var ids = _(req.params.ids.split('-')).map((v) => parseInt(v));
      if (_(ids).some((v) => isNaN(v))) {
        throw { status: 400 };
      }
      else {
        return ids;
      }
    }
    else {
      return [];
    }
  }
});

var obj = {};

obj = _.extend(obj, {
  start: (con, e, d, r) => {
    return new bluebird((resolve, reject) => {
      co(function* () {
        var fname_username = 'userid';
        var fname_password = 'password';

        passport.use(new passportlocal.Strategy({
          usernameField: fname_username,
          passwordField: fname_password,
          passReqToCallback: true
        }, (req, username, password, done) => {
          if (username === '') {
            done(null, false, { message: req.__('back.empty_username') });
          }
          else if (password === '') {
            done(null, false, { message: req.__('back.empty_password') });
          }
          else {
            co(function* () {
              var user = yield d[con.fname_user_by_name](username);
              if (user === null) {
                done(null, false, { message: req.__('back.wrong_username_or_password') });
              }
              else {
                if (password !== user[con.cname_password]) {
                  done(null, false, { message: req.__('back.wrong_username_or_password') });
                }
                else {
                  done(null, user);
                }
              }
            }).catch(done);
          }
        }));
        passport.serializeUser((user, done) => {
          done(null, user[con.cname_id]);
        });
        passport.deserializeUser((user_id, done) => {
          co(function* () {
            var ids = {};
            ids[con.cname_id] = user_id;

            var user = yield d[con.fname_user_by_id](ids);
            if (user === null) {
              done(null, {});
            }
            else {
              done(null, user);
            }
          }).catch(done);
        });

        var roles = _.values(r.get_roles());
        var entities = _.values(e.get_entities());
        var rapi = yield add_api_router(roles, entities, con, e, d);
        var rweb = yield add_web_router(roles, entities, con, e, d);

        var redis = connectredis(expresssession);

        var app = express();
        app.set('x-powered-by', false);
        app.set('case sensitive routing', true);
        app.set('strict routing', true);
        app.use(i18n.init);
        app.use(morgan('dev'));
        app.use('/asset', express.static(con.p_asset));
        app.use('/public', express.static(con.p_fspublic));
        app.use(expresssession({
          store: new redis({}),
          secret: con.session_secret,
          resave: false,
          saveUninitialized: false
        }));
        app.use(connectflash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.use((req, res, next) => {
          if (req.originalUrl.startsWith('/login')) {
            next();
          }
          else {
            try {
              if (req.originalUrl.startsWith('/api')) {
                var role = null;
                for (var i = 0; i < roles.length; i++) {
                  if (req.originalUrl.startsWith('/api' + roles[i].api)) {
                    if (role === null) {
                      role = roles[i];
                    }
                    else if (role.level_api <= roles[i].level_api) {
                      role = roles[i];
                    }
                  }
                }
                if (role === null) {
                  throw { status: 404 };
                }
                else {
                  role.auth_api(req, res, next);
                }
              }
              else {
                var role = null;
                for (var i = 0; i < roles.length; i++) {
                  if (req.originalUrl.startsWith(roles[i].web)) {
                    if (role === null) {
                      role = roles[i];
                    }
                    else if (role.level_web <= roles[i].level_web) {
                      role = roles[i];
                    }
                  }
                }
                if (role === null) {
                  throw { status: 404 };
                }
                else {
                  role.auth_web(req, res, next);
                }
              }
            }
            catch (err) {
              next(err);
            }
          }
        });
        app.get('/login', (req, res, next) => {
          co(function* () {
            var l = req.getLocale();
            var ldata = req.getCatalog(l).front;

            var p = path.join(con.p_front, 'login.ejs');
            var data = {
              title: con['appname_disp_' + l],
              errors: req.flash('error'),
              username_field: fname_username,
              password_field: fname_password,
              __: (n) => ldata[n]
            };
            yield common.send_res_with_html_ejs_from_path(res, p, data);
          }).catch(next);
        });
        app.post('/login', bodyparser.urlencoded({ extended: true }), (req, res, next) => {
          co(function* () {
            if (req.body[fname_username] === '') {
              req.flash('error', req.__('back.empty_username'));
              res.redirect('/login');
            }
            else if (req.body[fname_password] === '') {
              req.flash('error', req.__('back.empty_password'));
              res.redirect('/login');
            }
            else {
              next();
            }
          }).catch(next);
        }, passport.authenticate('local', {
          successRedirect: '/index',
          successFlash: '',
          failureRedirect: '/login',
          failureFlash: true
        }));
        app.get('/logout', (req, res, next) => {
          req.logout();
          res.redirect('/login');
        });
        app.use('/api', rapi);
        app.use('/', rweb);
        app.get('*', (req, res, next) => next({ status: 404 }));
        app.post('*', (req, res, next) => next({ status: 404 }));
        app.all('*', (req, res, next) => next({ status: 405 }));
        app.use((err, req, res, next) => {
          co(function* () {
            if (err.status) {
              yield common.send_res_with_message(res, err.status, err.message);
            }
            else {
              yield common.send_res_with_message(res, 500);

              console.error(err);
            }
          }).catch(next);
        });
        var server = app.listen(con.port, () => {
          resolve(server);
        });
        server.on('error', (err) => {
          console.error(err);
          process.exit(1);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  },
  end: (server) => {
    return new bluebird((resolve, reject) => {
      console.log('http server is closing...');
      server.close(() => {
        console.log('http server closed.');
        resolve(server);
      });
    });
  }
});

module.exports = obj;

async function add_api_router (roles, entities, con, e, d) {
  var jsonparser = bodyparser.json();

  var rapi = express.Router();
  await pi.forEachSeries(roles, async (v) => {
    var role = v;
    var rname = role.name;

    var rrole = express.Router();
    await pi.forEachSeries(entities, async (v) => {
      var entity = v;
      var name = entity.name;
      var pname = common.get_plural(name);
      var auth = entity.auth;

      if (auth.list.includes(rname)) {
        rrole.get('/' + pname, (req, res, next) => {
          co(function* () {
            var ids = yield role.list_id(req, entity, e, scommon);
            var list = yield d[name + '_list'](ids);
            yield common.send_res_with_json_type(res, list, _.result(req.query, 'type', 'json'));
          }).catch(next);
        });
      }
      if (auth.item.includes(rname)) {
        rrole.get('/' + pname + '/:ids', (req, res, next) => {
          co(function* () {
            var ids = yield role.item_id(req, entity, e, scommon);
            var item = yield d[name](ids);
            if (item === null) {
              throw { status: 404 };
            }
            else {
              yield common.send_res_with_json_type(res, item, _.result(req.query, 'type', 'json'));
            }
          }).catch(next);
        });
      }
      if (auth.new.includes(rname)) {
        rrole.post('/' + pname, jsonparser, (req, res, next) => {
          co(function* () {
            if (_.result(req.query, 'action', 'new') === 'new') {
              var ids = yield role.new_id(req, entity, e, scommon);
              var id = yield d[name + '_new'](ids, req.body);
              yield common.send_res_with_json(res, { id });
            }
            else {
              next();
            }
          }).catch(next);
        });
      }
      if (auth.update.includes(rname)) {
        rrole.post('/' + pname + '/:ids', jsonparser, (req, res, next) => {
          co(function* () {
            if (_.result(req.query, 'action', 'update') === 'update') {
              var ids = yield role.update_id(req, entity, e, scommon);
              yield d[name + '_update'](ids, req.body);
              yield common.send_res_with_message(res, 200);
            }
            else {
              next();
            }
          }).catch(next);
        });
      }
      if (auth.delete.includes(rname)) {
        rrole.post('/' + pname + '/:ids', (req, res, next) => {
          co(function* () {
            if (_.result(req.query, 'action', 'delete') === 'delete') {
              var ids = yield role.delete_id(req, entity, e, scommon);
              yield d[name + '_delete'](ids);
              yield common.send_res_with_message(res, 200);
            }
            else {
              next();
            }
          }).catch(next);
        });
      }
    });

    rapi.use(role.api, rrole);
  });

  return rapi;
}

async function add_web_router (roles, entities, con, e, d) {
  var rweb = express.Router();
  await pi.forEachSeries(roles, async (v) => {
    var role = v;

    if (role.auto_generate_web) {
      var rname = role.name;

      var rrole = express.Router();

      rrole.get('/index', (req, res, next) => {
        co(function* () {
          var data = {
            rname: rname,
            page: 'top',
            title: role.get_title(req, con)
          };

          yield send_res_page(req, res, data, con);
        }).catch(next);
      });

      await pi.forEachSeries(entities, async (v) => {
        var entity = v;
        var ename = entity.name;
        var pname = common.get_plural(ename);
        var auth = entity.auth;

        var bdata = {
          rname: rname,
          rurl: role.api,
          ename: ename,
          pname: pname
        };

        if (auth.list.includes(rname)) {
          rrole.get('/' + pname, (req, res, next) => {
            co(function* () {
              var pdata = {
                title: role.get_title(req, con),
                type: 'list',
                disp: entity['disp_' + req.getLocale()],
                is_update: auth.update.includes(rname),
                is_delete: auth.delete.includes(rname)
              };
              var data = _.extend(pdata, bdata);

              if (_.result(req.query, 'action', '') === '') {
                yield send_res(req, res, data, con);
              }
              else {
                next();
              }
            }).catch(next);
          });
        }
        if (auth.item.includes(rname)) {
          rrole.get('/' + pname + '/:ids', (req, res, next) => {
            co(function* () {
              var pdata = {
                title: role.get_title(req, con),
                type: 'item',
                is_new: false
              };
              var data = _.extend(pdata, bdata);

              var ids = yield scommon.handle_ids_parameter(req);
              yield send_res(req, res, data, con);
            }).catch(next);
          });
        }
        if (auth.new.includes(rname)) {
          rrole.get('/' + pname, (req, res, next) => {
            co(function* () {
              var pdata = {
                title: role.get_title(req, con),
                type: 'item',
                is_new: true
              };
              var data = _.extend(pdata, bdata);

              if (_.result(req.query, 'action', 'new') === 'new') {
                yield send_res(req, res, data, con);
              }
              else {
                next();
              }
            }).catch(next);
          });
        }
      });

      rweb.use(role.web, rrole);
    }
  });

  return rweb;
}

async function send_res(req, res, pdata, con) {
  var ldata = req.getCatalog(req.getLocale()).front;

  var p1 = path.join(con.p_entity, pdata.ename, pdata.type, 'page.ejs');
  if (!(await common.check_path(p1))) {
    p1 = path.join(con.p_front, 'type', pdata.type, 'page.ejs');
  }
  var p2 = path.join(con.p_front, 'main.ejs');
  var rdata = {
    lang: req.getLocale(),
    username: req.user.name,
    user_id: req.user.id,
    js: pdata.ename + '-' + pdata.type
  };
  var data = _.extend(rdata, pdata);
  data.ext = _.clone(data);
  data.__ = (n) => ldata[n];
  data.ldata = ldata;
  await common.send_res_with_html_2ejs_from_path(res, p1, p2, data, 'contents');
}

async function send_res_page(req, res, pdata, con) {
  var ldata = req.getCatalog(req.getLocale()).front;

  var p1 = path.join(con.p_front, 'page', pdata.page, 'page.ejs');
  var p2 = path.join(con.p_front, 'main.ejs');
  var rdata = {
    lang: req.getLocale(),
    username: req.user.name,
    user_id: req.user.id,
    js: pdata.page
  };
  var data = _.extend(rdata, pdata);
  data.ext = _.clone(data);
  data.__ = (n) => ldata[n];
  data.ldata = ldata;
  await common.send_res_with_html_2ejs_from_path(res, p1, p2, data, 'contents');
}
