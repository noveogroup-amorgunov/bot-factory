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
    <div class="type" data-type="question1">Question1</div>\
    <div class="type" data-type="question2">Question2</div>\
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
                text: $(typeObj).text()
            }
        );

    });

    $('body').on('click', '.dialog-item', function () {
        var id = $(this).data('id');
        $('.card-item:not([data-id="' + id + '"])').hide();
        $('.card-item[data-id="' + id + '"]').show();
    });
});


var textCard = `<div><input class="card-text" type="text"></input></div>`;
var question1Card = `<div><input class="card-question1" type="question-1"></input/>Card question</div>`;
var question2Card = `<div><input class="card-question2" type="question-2"></input/>Card question 2</div>`;
var imageCard = `<div class="card-image" type="image">Image<input></div>`;

function getCard(type) {
    switch (type) {
        case 'text':
            return textCard;
        case 'question1':
            return question1Card;
        case 'question2':
            return question2Card;
        case 'image':
            return imageCard;
    }

}