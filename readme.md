- Main structure of code, mainly include flask and extensions as follows:
    - flask,
    - flask_restplus,
    - flask_sqlalchemy,
    - flask_log,
    - flask_bcrypt,

- logging not included yet
    - https://wxnacy.com/2018/02/19/flask-log/
    - https://www.jianshu.com/p/9f08c72a148b
    - http://blog.wiseturtles.com/posts/flask-logging.html
    - https://stackoverflow.com/questions/39476889/use-flask-current-app-logger-inside-threading
    - https://stackoverflow.com/questions/39863718/how-can-i-log-outside-of-main-flask-module

- app
    - main
        - controller
            - __init__.py
            - auth_controller.py
            ```
            auth_namespace
            auth_model

            @auth_namespace('login')
            class Login():
                def post()

            @auth_namespace('logout')
            class Logout()
                @login_required
                def post()
            ```
            - user_controller.py
            ```
            user_namespace
            user_model

            @user_namespace('all')
            class GetAll():
                @login_required
                def get()

            @user_namespace('add')
            class AddUser():
                @login_required
                def post()
            ```
        - model
            - user.py
            ```
            @login_manager.user_loader
            def load_user(user_id)

            class User(db.Model, UserMixin):
                id/username/password/email = db.Column()

                def __init__(self, user_data)
                def __repr__()

                @property
                    def password(self):

                @password.setter
                    def password(self, password):

                def check_password(self, password):

                @classmethod
                def check_login(cls, user_data)

                def save/update/remove/find()
            ```
        - static (css and js)
        - templates (html)
        - toolbox (utility scripts)
        - __init__.py
        ```
        db = SQLAlchemy()
        bcrypt = Bcrypt()
        login_manager = LoginManager()

        def create_app(config_name):
            app = Flask(__name__)
            app.config.from_object(config_dict.get(config_name))

            db.init_app(app)
            bcrypt.init_app(app)
            init_login_manager(app)
            return app
        ```
        - config.py
        ```
        class Config/DevConfig/ProductionConfig
        config_dict = dict(
            dev = DevConfig,
            product = ProductionConfig,
        )
        ```
    - test
    - __init__.py
    ```
    api = Api(description, doc='/api/')
    api.add_namespace(auth_namespace, path='/')
    api.add_namespace(user_namespace, path='/user/')
    ```
- main_app.py
```
main_app = create_app('dev')

@main_app.route('/', methods=['GET'])
@main_app.route('/index', methods=['GET'])
def index():
  return render_template('index.html')

api.init_app(main_app)
main_app.app_context().push()

if __name__ == '__main__':
    app.run()
```
- readme.md
