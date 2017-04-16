var dial = {
    dialogs: []
};

var card = $(`
      <div class="card-item" data-id=""></div>
 `);
var dialogId = null;

$(function () {
    var dialogItem = '<div class="dialog-item">[TITLE]</div>';
    var cardsContainer = $('.wrapper .cards .items');
    var $cardsTitle = $('.wrapper .cards .title .title-input');

    var buildDialogs = function () {
        $.get('http://localhost:8081/dialogs').done(function (response) {
            var dialogs = response.dialogs;
            if (!dialogs) {
                return;
            }
            var plus = $('.sidebar-nav .group-item .block-item.plus');
            dialogs.forEach(function (dialog, index) {
                var newDialog = $(dialogItem.replace('[TITLE]', dialog.title));
                newDialog.attr('data-id', index);
                newDialog.insertBefore(plus);
            });
            dial.dialogs = dialogs;
        });
    };

    var sendDialogs = function () {
        $.ajax({
            url: 'http://localhost:8081/dialogs',
            method: 'POST',
            data: JSON.stringify(dial),
            contentType: 'application/json'
        });
    };

    var getMaxDialogId = function () {
        var maxId = 0;
        $('.sidebar-nav .group-item .dialog-item').each(function () {
            var id = $(this).data('id');
            if (id > maxId) {
                maxId = id;
            }
        });
        return maxId;
    };

    buildDialogs();

    $('.plus').on('click', function () {
        var dialLength = getMaxDialogId() + 1;
        var dialogTitle = 'title' + dialLength;
        dial.dialogs.push({
            title: dialogTitle,
            cards: []
        });
        $(dialogItem.replace('[TITLE]', dialogTitle)).attr('data-id', dialLength).insertBefore($(this));
    });

    $('body').on('blur', '.title-input', function () {
        var that = $(this);
        var titleDialog = that.val();
        $('.dialog-item[data-id="' + dialogId + '"]').html(titleDialog);
        dial.dialogs[dialogId].title = titleDialog;
        sendDialogs();
    });

    $('body').on('click', '.cards .type', function () {
        var type = $(this).data('type');
        var typeObj = getCard(type);
        $(typeObj).appendTo(cardsContainer);

        dial.dialogs[dialogId].cards.push({
            type: type,
            text: null
        });
    });

    $('body').on('blur', '.card-item input.card', function () {
        var that = $(this);
        var type = that.data('type');
        var number = that.closest('.card-item').index();

        dial.dialogs[dialogId].cards[number] = parseCard(type, that);
        sendDialogs();
    });

    $('body').on('click', '.dialog-item', function () {
        cardsContainer.html('');
        var id = $(this).data('id');
        dialogId = id;
        var dialog = dial.dialogs[id];
        $cardsTitle.val(dialog.title);
        dialog.cards.forEach(function (cardImport, i) {
            var newCard = card.clone().first().attr('data-id', id);

            if (cardImport) {
                newCard.appendTo(cardsContainer);
                var cardElement = renderCard(cardImport);
                if (cardElement) {
                    cardElement.appendTo(newCard);
                }
            }
        });
    });

    $('body').on('click', '.card-plus', function () {
        var that = $(this);
        $(userQuestionRow).insertBefore(that);
    });
});

var textCard =
    `<div class="card-wrapper card card-text">
      <div class="delete">X</div>
      <div class="card-hint">Бот ответит:</div>
      <input class="card card-text" data-type="text" type="text" placeholder="Введите ответа бота..."/>
    </div>`;
var userQuestionCard =
    `<div class="card-wrapper card card-user-question">
      <div class="delete">X</div>
      <div class="card-hint">Вопрос пользователю</div>
      <input class="card card-user-question-text" data-type="user-question"/> <br />
      <div class="card-plus questions-plus">добавить ответ</div>
    </div>`;

/*      <div class="questions">
        <div class="question">
           <select><option>Order Pizza</option></select> <input type="text" />
        </div>
        <div class="question">
           <select><option>Order Pizza</option></select> <input type="text" />
        </div>
      </div>*/

var dialogQuestionCard =
    `<div class="card-wrapper card card-text">
        <div class="delete">X</div>
        <div class="card-hint">Сохранение информации</div>
        <div><input class="card card-dialog-question-text" data-type="dialog-question" type="text"/><br><br></div>
        <div class="card-hint">В атрибут</div>
        <input class="card card-dialog-question-attr" data-type="dialog-question" type="text"/>
     </div>`;
var jsonCard =
    `<div class="card-wrapper card card-json-api">
      <div class="delete">X</div>
      <div class="card-hint">Интеграция с api-сервером</div>
      <select><option>GET</option><option>POST</option></select> <input class="card card-json" data-type="json-api" type="text"/>
    </div>`;
var imageCard =
    '<div class="card-wrapper"> \
        <input class="card card-image" data-type="image" type="text"/>\
    </div>';

var userQuestionRow =
    '<div class="card-row">\
        <input class="card card-user-question-row-dialog" data-type="user-question" type="text"/>\
        <input class="card card-user-question-row-value" data-type="user-question" type="text"/>\
     </div>';

function getCard(type) {
    var clone = card.clone();

    switch (type) {
        case 'text':
            clone.append($(textCard));
        break;
        case 'user-question':
            clone.append($(userQuestionCard));
            break;
        case 'dialog-question':
            clone.append($(dialogQuestionCard));
            break;
        case 'json-api':
            clone.append($(jsonCard));
            break;
        case 'image':
            clone.append($(imageCard));
            break;

    }
    return clone;
}

function renderCard(card) {
    var cardElement = '';
    switch (card.type) {
        case 'text':
            cardElement = $(textCard).clone();
            cardElement.find('.card').val(card.text);
            break;
        case 'user-question':
            cardElement = $(userQuestionCard).clone();
            cardElement.find('.card').val(card.text);
            card.answers.forEach(function (cardImport) {
                var row = $(userQuestionRow);
                row.find('.card-user-question-row-dialog').val(cardImport.dialog);
                row.find('.card-user-question-row-value').val(cardImport.text);
                row.insertBefore(cardElement.find('.card-plus'));
            });
            break;
        case 'dialog-question':
            cardElement = $(dialogQuestionCard).clone();
            cardElement.find('.card-dialog-question-text').val(card.text);
            cardElement.find('.card-dialog-question-attr').val(card.attribute);
            break;
        case 'json-api':
            cardElement = $(jsonCard).clone();
            cardElement.find('.card').val(card.text);
            break;
        case 'image':
            cardElement = $(imageCard).clone();
            cardElement.find('.card').val(card.text);
            break;
    }

    return cardElement;
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
                    dialog: that.find('.card-user-question-row-dialog').val(),
                    value: that.find('.card-user-question-row-value').val()
                });
            });
            break;
        case 'dialog-question':
            wrapper = typeObj.parent();
            result.text = wrapper.find('.card-dialog-question-text').val();
            result.attribute = wrapper.find('.card-dialog-question-attr').val();
            break;
        case 'json-api':
            result.text = typeObj.val();
            break;
        case 'image':
            result.text = typeObj.val();
            break;
    }
    return result;
}
