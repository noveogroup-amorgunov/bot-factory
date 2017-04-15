var dial = {
    dialogs: [
        /*        {
         title: 'Block 1 for Hello user',
         cards: [{
         text: "Hello user",
         type: 'text'
         }, {
         text: "How are you?"
         }]
         }, {
         title: 'help',
         cards: ['....']
         }*/
    ]
};


$(function () {
    var card = $('<div class="card-item" data-id=""><input class="title-input" placeholder="title" maxlength="25" type="text"> \
    <div class="types">\
    <div class="type" data-type="text">Text</div>\
    <div class="type" data-type="user-question">User Question</div>\
    <div class="type" data-type="dialog-question">Dialog Question</div>\
    <div class="type" data-type="json">JSON API</div>\
    <div class="type" data-type="image">Image</div>\
    </div>\
    </div>');

    $('.plus').on('click', function () {
        var cardsContainer = $('.container .cards');
        var dialLength = dial.dialogs.length + 1;
        var dialogTitle = 'title' + dialLength;

        dial.dialogs.push({
            title: dialogTitle,
            cards: []
        });

        $('<div class="dialog-item">' + dialogTitle + '</div>').attr('data-id', dialLength).insertBefore($(this));
        var newCard = card.clone().first().attr('data-id', dialLength);
        newCard.find('.title-input').attr('placeholder', dialogTitle);
        newCard.appendTo(cardsContainer);
        $('.card-item:not([data-id="' + dialLength + '"])').hide();
    });

    $('body').on('blur', '.title-input', function () {
        var that = $(this);
        var dialogId = that.parent('.card-item').data('id');
        var titleDialog = that.val();
        $('.dialog-item[data-id="' + dialogId + '"]').html(titleDialog);
        dial.dialogs[dialogId - 1].title = titleDialog;
    });

    $('body').on('click', '.card-item .type', function () {
        var type = $(this).data('type');
        var typeObj = getCard(type);
        var dialogId = $(this).closest('.card-item').attr('data-id') - 1;
        $(typeObj).insertBefore($(this).parent('.types'));
        var dialog = dial.dialogs[dialogId];
        dialog.cards.push(
            {
                type: type,
                text: null
            }
        );
    });

    $('body').on('blur', '.card-item .card', function () {
        var that = $(this);
        var dialogId = that.closest('.card-item').data('id') - 1;
        var type = that.data('type');
        var number = that.closest('.card-wrapper').index() - 1;

        dial.dialogs[dialogId].cards[number] = parseCard(type, that);
    });

    $('body').on('click', '.dialog-item', function () {
        var id = $(this).data('id');
        $('.card-item:not([data-id="' + id + '"])').hide();
        $('.card-item[data-id="' + id + '"]').show();
    });

    $('body').on('click', '.card-plus', function () {
        var that = $(this);
        $(userQuestionRow).insertBefore(that);
    });
});

var textCard =
    '<div class="card-wrapper">\
        <input class="card card-text" data-type="text" type="text"/>\
    </div>';
var userQuestionCard =
    '<div class="card-wrapper">\
        <input class="card card-user-question-text" data-type="user-question"/>\
        <div class="card-plus">Plus</div>\
    </div>';
var dialogQuestionCard =
    '<div class="card-wrapper">\
        <input class="card card-dialog-question-text" data-type="dialog-question" type="text"/>\
        <input class="card card-dialog-question-attr" data-type="dialog-question" type="text"/>\
     </div>';
var jsonCard =
    '<div class="card-wrapper">\
        <input class="card card-json" data-type="json" type="text"/>\
    </div>';
var imageCard =
    '<div class="card-wrapper"> \
        <input class="card card-image" data-type="image" type="text"/>\
    </div>';

var userQuestionRow =
    '<div class="card-row">\
        <input class="card card-user-question-row-block" data-type="user-question" type="text"/>\
        <input class="card card-user-question-row-value" data-type="user-question" type="text"/>\
     </div>';

function getCard(type) {
    switch (type) {
        case 'text':
            return textCard;
        case 'user-question':
            return userQuestionCard;
        case 'dialog-question':
            return dialogQuestionCard;
        case 'json':
            return jsonCard;
        case 'image':
            return imageCard;
    }
}

function parseCard(type, typeObj) {
    var wrapper;
    var result = {
        type: type
    };
    switch (type) {
        case 'text':
            result.text = typeObj.val();
            break;
        case 'user-question':
            wrapper = typeObj.closest('.card-wrapper');
            result.text = wrapper.find('.card-user-question-text').val();
            result.answers = [];
            wrapper.find('.card-row').each(function () {
                var that = $(this);
                result.answers.push({
                    block: that.find('.card-user-question-row-block').val(),
                    value: that.find('.card-user-question-row-value').val()
                });
            });
            break;
        case 'dialog-question':
            wrapper = typeObj.parent();
            result.text = wrapper.find('.card-dialog-question-text').val();
            result.attribute = wrapper.find('.card-dialog-question-attr').val();
            break;
        case 'json':
            result.text = typeObj.val();
            break;
        case 'image':
            result.text = typeObj.val();
            break;
    }
    return result;
}