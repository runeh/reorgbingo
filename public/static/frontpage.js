window.addEventListener('load', init);

function init() {
    newGameController();
    newGuessController();
}

function newGameController() {
    var form = document.querySelector('[data-controller=newgame]');
    if (!form) { return }

    var throbber = form.querySelector('[data-throbber]');

    form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        throbber.classList.remove('hidden');
        var request = new XMLHttpRequest();
        request.open('POST', form.action);
        request.send(new FormData(form));
        request.onloadend = function() {
            throbber.classList.add('hidden');

            if (request.status == 201) {
                window.location = request.getResponseHeader("location");
            }
            else {
                // fixme: add form feedback shit
            }

        }
    });
}

function newGuessController() {
    var form = document.querySelector('[data-controller=newguess]');
    if (!form) { return }

    var throbber = form.querySelector('[data-throbber]');

    form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        throbber.classList.remove('hidden');
        var request = new XMLHttpRequest();
        request.open('POST', form.action);
        request.send(new FormData(form));
        request.onloadend = function() {
            throbber.classList.add('hidden');
            if (request.status == 201) {
                var guess = JSON.parse(request.responseText);
                console.log(guess);
            }
            else {
                // fixme: add form feedback shit
            }

        }
    });
}


