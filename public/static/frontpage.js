window.addEventListener('load', init);

function init() {
    newGameController();
    newGuessController();
}

function httpPost(url, payload, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', url);
    request.onloadend = function() { callback(request); };
    request.send(payload);
}

function newGameController() {
    var form = document.querySelector('[data-controller=newgame]');
    if (!form) { return }

    var throbber = form.querySelector('[data-throbber]');

    form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        throbber.classList.remove('hidden');

        httpPost(form.action, new FormData(form), function(request) {
            throbber.classList.add('hidden');

            if (request.status == 201) {
                window.location = request.getResponseHeader("location");
            }
            else {
                // fixme: add form feedback shit
            }
        });
    });
}

function newGuessController() {
    var form = document.querySelector('[data-controller=newguess]');
    if (!form) { return }

    var throbber = form.querySelector('[data-throbber]');

    form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        throbber.classList.remove('hidden');

        httpPost(form.action, new FormData(form), function(request) {
            throbber.classList.add('hidden');
            if (request.status == 201) {
                var guess = JSON.parse(request.responseText);
                var box = document.querySelector('[data-guessbox]');
                box.parentNode.removeChild(box);
                var li = document.createElement('li');
                li.textContent = guess.name + ' ' + guess.date;
                var list = document.querySelector('[data-guess-list]');
                list.appendChild(li);

                li = document.querySelector('[data-no-guess-placeholder]');
                if (li) {
                    li.parentNode.removeChild(li);
                }

            }
            else {
                // fixme: add form feedback shit
            }
        });
    });
}


