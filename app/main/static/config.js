
let
    ordersPerPage = 10,
    createDaySort = -1,
    pageCount = 0,
    pageGroupCount = 5,
    paginationRightBorder = 0,
    imageHost = 'localhost';


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
                                <span class="createDaySort-down is-selected">
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
                                <span class="ordersPerPage-10 is-selected">10</span>
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

let storeConfig = function() {
    log('config.storeConfig()');
    return {
        createDaySortSelected: $('.createDaySort-options>span.is-selected').get(0).classList[0],
        ordersPerPageSelected: $('.ordersPerPage-options>span.is-selected').get(0).classList[0],
    };
};

let restoreConfig = function(configSelected) {
    log(`config.storeConfig() [${JSON.stringify(configSelected)}]`);
    $('.createDaySort-options>span.is-selected').toggleClass('is-selected');
    $(`.createDaySort-options>span.${configSelected.createDaySortSelected}`).toggleClass('is-selected');
    $('.ordersPerPage-options>span.is-selected').toggleClass('is-selected');
    $(`.ordersPerPage-options>span.${configSelected.ordersPerPageSelected}`).toggleClass('is-selected');
};

let saveConfig = function() {
    log('config.saveConfig()');
    let createDaySortSpan = $('.createDaySort-options>span.is-selected').get(0);
    let createDaySort = createDaySortSpan.classList.contains('createDaySort-down') ? -1 : 1; // desc or asc
    let ordersPerPageSpan = $('.ordersPerPage-options>span.is-selected').get(0);
    let ordersPerPage = ordersPerPageSpan.classList.contains('ordersPerPage-10') ? 10 : (
        ordersPerPageSpan.classList.contains('ordersPerPage-15') ? 15 : 20
    );
    return {
        createDaySort: createDaySort,
        ordersPerPage: ordersPerPage,
    };
};

// show or hide config panel
let toggleConfigPanel = function() {
    log('config.toggleConfigPanel()');
    let configSelected;
    $('.config-close-icon, .button.is-info.cancel').click(function(event) {
        log('closing config panel');
        $('.config-options-container').animate({
            left: '-=12rem',
        }, {
            complete: function() {
                // log(configSelected);
                restoreConfig(configSelected);
            },
        });
    });

    $('.button.is-info.ok').click(function(event) {
        log('saving createDaySort and ordersPerPage');
        $('.config-options-container').animate({
            left: '-=12rem',
        }, {
            complete: function() {
                log('calling toggleConfig');
                let configs = saveConfig();
                ordersPerPage = configs.ordersPerPage;
                createDaySort = configs.createDaySort;

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

    $('.config-cog').click(function(event) {
        log('opening config panel');
        configSelected = storeConfig();
        $('.config-options-container').animate({
            left: '+=12rem',
        });
    });
};

// select ordersPerPage and createDaySortSort
let selectConfigOptions = function() {
    log('config.selectConfigOptions()');
    let createDaySortSpans = $('.createDaySort-options>span');
    createDaySortSpans.click(function(event) {
        // donno why the event.target is <i>
        let createDaySortSpan = event.target.parentNode;
        // console.log(createDaySortSpan);
        if (createDaySortSpan.tagName === 'SPAN' &&
            !createDaySortSpan.classList.contains('is-selected')) {
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

// starting point
populateConfigContainer();
toggleConfigPanel();
selectConfigOptions();
