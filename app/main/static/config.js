
// populate <section class="config-container"></section> with configWrapperHtml
let populateConfigContainer = function() {
    log('config.populateConfigContainer()');
    let configWrapperHtml = `
        <div class="config-wrapper">
            <div class="config-cog">
                <span>
                    <i class="fas fa-cog fa-2x"></i>
                </span>
            </div>
            <div class="config-options-container">
                <div class="config-options-wrapper">
                    <div class="config-close">
                        <div class="config-close-icon">
                            <span>
                                <i class="far fa-times-circle fa-2x"></i>
                            </span>
                        </div>
                    </div>
                    <div class="config-options">
                        <div class="config-options-name">
                            <span>Config</span>
                        </div>
                        <hr />
                        <div class="config-options-createDaySort">
                            <div class="createDaySort-title">
                                <span>订单日期:</span>
                            </div>
                            <div class="createDaySort-options">
                                <span class="createDaySort-down">
                                    <i class="fas fa-sort-amount-down fa-2x"></i>
                                </span>
                                <span class="createDaySort-up">
                                    <i class="fas fa-sort-amount-up fa-2x"></i>
                                </span>
                            </div>
                        </div>
                        <div class="config-options-ordersPerPage">
                            <div class="ordersPerPage-title">
                                <span>每页显示:</span>
                            </div>
                            <div class="ordersPerPage-options">
                                <span class="ordersPerPage-10">10</span>
                                <span class="ordersPerPage-15">15</span>
                                <span class="ordersPerPage-20">20</span>
                            </div>
                        </div>
                    </div>
                    <div class="config-options-confirm">
                        <button class="button is-info cancel">Cancel</button>
                        <button class="button is-info ok">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('.config-container').append($(configWrapperHtml));
};

let setConfig = function() {
    log('config.setConfig()');
    $('.createDaySort-options>span').removeClass('is-selected');
    $('.ordersPerPage-options>span').removeClass('is-selected');

    let configData = JSON.parse(sessionStorage.getItem('config'));
    $(`.createDaySort-options>span.${configData.createDaySort === -1 ? 'createDaySort-down' : 'createDaySort-up'}`).addClass('is-selected');
    $(`.ordersPerPage-options>span.ordersPerPage-${configData.ordersPerPage}`).addClass('is-selected');
};

let saveConfig = function() {
    log('config.saveConfig()');
    // desc or asc
    createDaySort = $('.createDaySort-options>span.is-selected').attr('class').split(' ')[0] === 'createDaySort-down' ? -1 : 1;
    // 'ordersPerPage-10 is-selected' -->split(' ')[0]--> 'ordersPerPage-10' -->split('-')[1])--> '10'
    ordersPerPage = parseInt($('.ordersPerPage-options>span.is-selected').attr('class').split(' ')[0].split('-')[1]);
    sessionStorage.setItem('config', JSON.stringify({
        createDaySort: createDaySort,
        ordersPerPage: ordersPerPage,
    }));
};

// show or hide config panel
let bindEvent2ConfigPanel = function() {
    log('config.bindEvent2ConfigPanel()');
    $('.config-cog').click(function(event) {
        log('opening config panel');
        setConfig();
        $('.config-options-container').animate({
            left: '+=12rem',
        });
    });

    $('.config-close-icon, .button.is-info.cancel').click(function(event) {
        log('closing config panel');
        $('.config-options-container').animate({
            left: '-=12rem',
        }, {
            // complete: function() {
            //     setConfig();
            // },
        });
    });

    $('.button.is-info.ok').click(function(event) {
        log('saving createDaySort and ordersPerPage');
        $('.config-options-container').animate({
            left: '-=12rem',
        }, {
            complete: function() {
                log('calling toggleConfig');
                saveConfig();

                let searchData = getSearchData();
                // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
                if (Object.keys(searchData).length === 0 && searchData.constructor === Object) {
                    makePagination();
                } else {
                    makePagination4Search(searchData);
                }
            },
        });
    });
};

// select ordersPerPage and createDaySortSort
let bindEvent2ConfigOptions = function() {
    log('config.bindEvent2ConfigOptions()');
    let createDaySortSpans = $('.createDaySort-options>span');
    createDaySortSpans.click(function(event) {
        // donno why the event.target is <i>
        let createDaySortSpan = event.target.parentNode;
        // console.log(createDaySortSpan);
        if (createDaySortSpan.tagName === 'SPAN' && !createDaySortSpan.classList.contains('is-selected')) {
            createDaySortSpans.toggleClass('is-selected');
        }
    });

    let ordersPerPageSpans = $('.ordersPerPage-options>span');
    ordersPerPageSpans.click(function(event) {
        // console.log(event.target);
        if (!event.target.classList.contains('is-selected')) {
            $('.ordersPerPage-options>.is-selected').toggleClass('is-selected');
            $(event.target).toggleClass('is-selected');
        }
    });
};
