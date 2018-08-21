
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
            <div class="login-failed is-off">
                <span>Login Failed, incorrect Username or Password.</span>
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
            rememberMe: $('.field-login-rememberMe>input[type="checkbox"]').prop('checked'),
        }),
        contentType: 'application/json; charset=UTF-8',
        beforeSend: function(jqXHR, settings) {
            jqXHR.url = settings.url;
        },
        success: function(response, status, jqXHR) {
            if (response === null) {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN FAILED');
                $('.login-failed').removeClass('is-off');
            } else {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN SUCCEEDED');
                // log(`sendLoginAjax: ${$('.login-container').attr('class')}`);
                toggleContainers('afterLogin');
                makePagination();
                $('.login-failed').addClass('is-off');
            }
        },
        error: printAjaxError,
    });
};

let bindEvent2Login = function() {
    log('login-logout.bindEvent2Login()');
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
let bindEvent2Logout = function() {
    log('login-logout.bindEvent2Logout()');
    $('.logout-container').click(function(event) {
        $.ajax({
            url: '/logout',
            method: 'POST',
            data: '{}',
            contentType: 'application/json; charset=UTF-8',
            beforeSend: function(jqXHR, settings) {
                jqXHR.url = settings.url;
            },
            success: function(response) {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGOUT SUCCEEDED');
                window.history.pushState(null, '', '/login');
                toggleContainers('afterLogout');
                sessionStorage.removeItem('config');
                sessionStorage.removeItem('searchData');
                $('.login-failed').addClass('is-off');
            },
            error: printAjaxError,
        });
    });
};
