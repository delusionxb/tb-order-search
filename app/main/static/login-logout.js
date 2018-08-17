
let populateLoginContainer = function() {
    log('login-logout.populateLoginContainer()');
    let loginWrapper = `
        <div class="login-wrapper">
            <div class="login-logo">
                <div class="login-logo-img">
                    <img src="../static/my_icon.jpg">
                </div>
                <div class="login-logo-name">
                    <span>TB Order Search</span>
                </div>
            </div>

            <div class="field username">
                <label class="label">Username</label>
                <div class="control">
                    <input class="input" type="text" placeholder="username">
                </div>
            </div>

            <div class="field password">
                <label class="label">Password</label>
                <div class="control">
                    <input class="input" type="password" placeholder="password">
                </div>
            </div>

            <div class="field login">
                <div class="control">
                    <div class="field-login-rememberMe">
                        <input type="checkbox">
                        <span>Remember Me</span>
                    </div>
                    <div class="field-login-button">
                        <button class="button is-info">Login</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('.login-container').append($(loginWrapper));
};

let sendLoginAjax = function(username, password) {
    log('login-logout:sendLoginAjax()');
    $.ajax({
        url: '/login',
        method: 'POST',
        data: JSON.stringify({
            username: username.val(),
            password: password.val(),
        }),
        contentType: 'application/json; charset=UTF-8',
        success: function(response) {
            if (response === null) {
                log('login failed');
            } else {
                log('login succeeded');
                // log(response);
                sessionStorage.setItem('loginUser', JSON.stringify(response));
                displayContainers();
            }
        },
    });
};

let bindLogin = function() {
    log('login-logout.bindLogin()');
    $('.field-login-button>.button').click(function(event) {
        sendLoginAjax(username, password);
    });

    password.keypress(function(event) {
        if (event.key === 'Enter') {
            event.target.blur();
            event.preventDefault();
            sendLoginAjax(username, password);
        }
    });
};

let bindLogout = function() {
    log('login-logout.bindLogout()');
    $('.logout-container').click(function(event) {
        $.ajax({
            url: '/logout',
            method: 'POST',
            data: '{}',
            contentType: 'application/json; charset=UTF-8',
            success: function(response) {
                log('logout succeeded');
                sessionStorage.removeItem('loginUser');
                displayContainers();
            }
        });
    });
};

let displayContainers = function() {
    let loginUser = sessionStorage.getItem('loginUser');
    log(`login-logout.displayContainers() -> current logged in user: ${JSON.stringify(loginUser)}`);
    if (loginUser === null) {
        $('.login-container').removeClass('is-off');
        $('.logout-container').addClass('is-off');
        $('.super-main-container').addClass('is-off');

        // $('.login-container').toggleClass('is-off');
        // $('.logout-container').toggleClass('is-off');
        // $('.super-main-container').toggleClass('is-off');

        username.val('');
        password.val('');

        $('.main-orders-list').remove();
        $('.pagination-wrapper').remove();
    } else {
        $('.login-container').addClass('is-off');
        $('.logout-container').removeClass('is-off');
        $('.super-main-container').removeClass('is-off');

        // $('.login-container').toggleClass('is-off');
        // $('.logout-container').toggleClass('is-off');
        // $('.super-main-container').toggleClass('is-off');

        populatePaginationContainer();
        makePagination();
    }
};

populateLoginContainer();
let username = $('.field.username input');
let password = $('.field.password input');
displayContainers();
bindLogin();
bindLogout();
