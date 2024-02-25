const express = import('express');
const session = import('express-session');
const passport = import('passport');
const LocalStrategy = import('passport-local').Strategy;
const bodyParser = import('body-parser');
const path = import('path');

// Importar rutas
const indexRouter = import('./routes/index');
const usersRouter = import('./routes/users');

// Crear aplicación
const app = express();

// Configurar vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configurar middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret code', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Configurar Passport
passport.use(new LocalStrategy({usernameField: 'email'},
  function(email, password, done) {
    // Aquí iría la lógica para validar el usuario
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // Aquí iría la lógica para obtener el usuario a partir del id
});

// Configurar rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Iniciar servidor
app.listen(8080, () => {
  console.log('App is listening on port 8080');
});

module.exports = app;
