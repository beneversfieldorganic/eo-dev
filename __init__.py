import flask
from flask import Flask, render_template, redirect, request, url_for
import flask_login
from .func_postcodes import render as render_postcodes
login_manager = flask_login.LoginManager()

app = Flask(__name__)
app.secret_key = 'super secret string'  # Change this!
login_manager.init_app(app)

users = {'admin': {'password': 'admin'}}

class User(flask_login.UserMixin):
    pass

@login_manager.user_loader
def user_loader(email):
    if email not in users:
        return
    user = User()
    user.id = email
    return user

@login_manager.request_loader
def request_loader(request):
    username = request.form.get('username')
    if username not in users:
        return
    user = User()
    user.id = username
    # DO NOT ever store passwords in plaintext and always compare password
    # hashes using constant-time comparison!
    user.is_authenticated = request.form['password'] == users[username]['password']
    return user

@app.route('/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'GET':
        return render_template('login.html')
    if flask.request.method == 'POST':
        username = flask.request.form['username']
        if flask.request.form['password'] == users[username]['password']:
            user = User()
            user.id = username
            flask_login.login_user(user)
            return flask.redirect(flask.url_for('index'))
    return 'Bad login'

@app.route('/postcodes', methods=['GET', 'POST'])
@flask_login.login_required
def postcodes():
    values = request.values.to_dict()
    template = 'postcodes.html'
    return render_postcodes(values, template)


@app.route('/protected')
@flask_login.login_required
def protected():
    return 'Logged in as: ' + flask_login.current_user.id

@login_manager.unauthorized_handler
def unauthorized_handler():
    return flask.redirect(flask.url_for('login'))

@app.route('/logout')
def logout():
    flask_login.logout_user()
    return flask.redirect(flask.url_for('login'))

@app.route('/')
@flask_login.login_required
def index():
    values = {}
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
