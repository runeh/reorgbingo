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
                console.log(guess);
            }
            else {
                // fixme: add form feedback shit
            }
        });
    });
}


