
let populateTopBottomContainer = function() {
    log('top-bottom.populateTopBottomContainer()');
    let topBottomWrapperHtml = `
        <div class="top-bottom-wrapper">
            <div class="top-bottom to-top">
                <span>
                    <i class="fas fa-arrow-alt-circle-up fa-3x"></i>
                </span>
            </div>
            <div class="top-bottom to-bottom">
                <span>
                    <i class="fas fa-arrow-alt-circle-down fa-3x"></i>
                </span>
            </div>
        </div>
    `;

    $('.top-bottom-container').append($(topBottomWrapperHtml));
};

let bindEvent2TopBottom = function() {
    log('top-bottom.bindEvent2TopBottom()');
    $('.top-bottom.to-top').click(function(event) {
        window.scrollTo(0, 0);
    });

    $('.top-bottom.to-bottom').click(function(event) {
        window.scrollTo(0, 100000);
    });
};
