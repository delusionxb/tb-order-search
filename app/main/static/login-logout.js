
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
    log('login-logout.sendLoginAjax()');
    $.ajax({
        url: '/login',
        method: 'POST',
        data: JSON.stringify({
            username: username.val(),
            password: password.val(),
        }),
        contentType: 'application/json; charset=UTF-8',
        success: function(response, status, jqXHR) {
            if (response === null) {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN FAILED');
            } else {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN SUCCEEDED');
                // log(`sendLoginAjax: ${$('.login-container').attr('class')}`);
                toggleContainers('afterLogin');
                makePagination();
            }
        },
        error: printAjaxError,
    });
};

let bindAction2Login = function() {
    log('login-logout.bindAction2Login()');
    let username = $('.field.username input');
    let password = $('.field.password input');
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

// https://stackoverflow.com/questions/3338642/updating-address-bar-with-new-url-without-hash-or-reloading-the-page
let bindAction2Logout = function() {
    log('login-logout.bindAction2Logout()');
    $('.logout-container').click(function(event) {
        $.ajax({
            url: '/logout',
            method: 'POST',
            data: '{}',
            contentType: 'application/json; charset=UTF-8',
            success: function(response) {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGOUT SUCCEEDED');
                window.history.pushState(null, '', '/login');
                toggleContainers('afterLogout');
            },
            error: function(jqXHR, status, error) {
                log(`jqXHR: ${jqXHR}, status: ${status}, error: ${error}`);
            },
        });
    });
};
