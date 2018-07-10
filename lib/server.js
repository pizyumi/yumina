var _ = require('underscore');
var bluebird = require('bluebird');
var bodyparser = require('body-parser');
var co = require('co');
var connectflash = require('connect-flash');
var connectredis = require('connect-redis');
var express = require('express');
var expresssession = require('express-session');
var morgan = require('morgan');
var passport = require('passport');
var passportlocal = require('passport-local');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
  start: (con, d, r) => {
    return new bluebird((resolve, reject) => {
      co(function* () {
        var fname_username = 'userid';
        var fname_password = 'password';

        passport.use(new passportlocal.Strategy({
          usernameField: fname_username,
          passwordField: fname_password
        }, (username, password, done) => {
          if (username === '') {
            done(null, false, { message: 'ユーザーIDを入力してください。' });
          }
          else if (password === '') {
            done(null, false, { message: 'パスワードを入力してください。' });
          }
          else {
            co(function* () {
              var user = yield d[con.fname_user_by_name](username);
              if (user === null) {
                done(null, false, { message: 'ユーザーIDかパスワードが間違っています。' });
              }
              else {
                if (password !== user[con.cname_password]) {
                  done(null, false, { message: 'ユーザーIDかパスワードが間違っています。' });
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
              done(new Error('database data error.'));
            }
            else {
              done(null, user);
            }
          }).catch(done);
        });

        var roles = _.values(r.get_roles());

        var redis = connectredis(expresssession);

        var app = express();
        app.set('x-powered-by', false);
        app.set('case sensitive routing', true);
        app.set('strict routing', true);
        app.use(morgan('dev'));
        app.use('/asset', express.static('asset'));
        app.use('/public', express.static(con.p_public));
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
            var p = path.join('front', 'login.ejs');
            var data = {
              title: con.appname,
              errors: req.flash('error'),
              username_field: fname_username,
              password_field: fname_password
            };
            yield common.send_res_with_html_ejs_from_path(res, p, data);
          }).catch(next);
        });
        app.post('/login', bodyparser.urlencoded({ extended: true }), (req, res, next) => {
          co(function* () {
            if (req.body[fname_username] === '') {
              req.flash('error', 'ユーザーIDを入力してください。');
              res.redirect('/login');
            }
            else if (req.body[fname_password] === '') {
              req.flash('error', 'パスワードを入力してください。');
              res.redirect('/login');
            }
            else {
              next();
            }
          }).catch(next);
        }, passport.authenticate('local', {
          successRedirect: '/',
          successFlash: 'ログインしました。',
          failureRedirect: '/login',
          failureFlash: true
        }));
        app.get('/logout', (req, res, next) => {
          req.logout();
          res.redirect('/login');
        });
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
