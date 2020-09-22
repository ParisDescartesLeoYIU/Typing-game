class TypingGame {

    dynamicValues;
    dynamicValuesElement;
    secondsLimit;
    secondsLimitMin;
    score;

    words;
    word;

    constructor(
        {
            secondsLimit = 15,
            secondsLimitMin = 3,
        } = {}
    ) {

        const score = 0;

        this.score = score;


        this.dynamicValues = {};
        this.dynamicValues['max-sec'] = secondsLimit;
        this.dynamicValues['remaining-time'] = secondsLimit + 1;
        this.dynamicValues['status'] = "Go !";
        this.dynamicValues['score'] = score;

        this.dynamicValuesElement = document.querySelectorAll('span[data-dynamic]');
        this.originalSecondsLimit = secondsLimit;
        this.secondsLimitMin = secondsLimitMin;
        this.secondsLimit = secondsLimit;

        this.words = [];
        this.initializeWords();

        this.updateDynamicValues();
    }

    updateDynamicValues() {
        const names = Object.keys(this.dynamicValues);
        const values = Object.values(this.dynamicValues);
        for (
            let cursor = 0, cursorMax = names.length;
            cursor < cursorMax;
            cursor++
        ) {
            const name = names[cursor];
            this.updateDynamicValue(name);
        }
    }

    updateDynamicValue(name) {
        const value = this.dynamicValues[name];
        const dynamicValueElements = document.querySelectorAll(`span[data-dynamic][data-name="${name}"]`)
        for (
            let cursorElement = 0, cursorMaxElement = dynamicValueElements.length;
            cursorElement < cursorMaxElement;
            cursorElement++
        ) {
            const element = dynamicValueElements[cursorElement];
            element.innerHTML = value;
        }
    }

    initializeWords() {
        let words = [];

        fetch('text.txt').then(response => {
            return response.text();
        }).then(response => {
            response = response.replace(/,/ig, ' ');
            response = response.replace(/\./ig, ' ');
            response = response.replace(/\r/ig, ' ');
            response = response.replace(/\n/ig, ' ');

            return response.split(' ');
        }).then(_words => {
            for (
                let cursor = 0, cursorMax = _words.length;
                cursor < cursorMax;
                cursor++
            ) {
                let word = _words[cursor];

                word = word.replace(/,/, ' ');
                word = word.replace(/\./, ' ');

                if ('' === word) continue;

                const hasNumber = /[0-9]/ig.test(word);
                if (true === hasNumber) continue;

                const hasSingleQuote = /’/ig.test(word);
                if (true === hasSingleQuote) {
                    const indexOfSingleQuote = word.indexOf("’");
                    word = word.slice(indexOfSingleQuote + 1);
                }
                words.push(word.toLowerCase());
            }
        }).finally(() => {
            words = words.filter(function onlyUnique(value, index, self) {
                return self.indexOf(value) === index && 3 < value.length;
            });
            this.words = words;
            this.start();
        })
    }

    start() {
        this.setWord();
        this.startCountdown();
        this.enableInputForUser();
    }

    startCountdown() {
        this._countdownInterval();
    }

    _countdownInterval() {
        const secondsRemaining = this.dynamicValues['remaining-time'];
        if (0 === secondsRemaining) {
            this.end();
            return;
        }
        this.dynamicValues['remaining-time'] = secondsRemaining - 1;
        this.updateDynamicValue('remaining-time');

        setTimeout(() => this._countdownInterval(), 1000);
    }

    setWord() {
        const randomPosition = Math.floor(Math.random() * this.words.length);
        const selectedWord = this.words[randomPosition];
        if (selectedWord === this.word) {
            this.setWord();
            return;
        }
        this.word = selectedWord;
        this.dynamicValues['guess-word'] = selectedWord;
        this.updateDynamicValue('guess-word');
    }

    end() {
        const section = document.querySelector('section[data-name="play"]');
        const input = section.querySelector('input[name="user-word"]');
        setTimeout(function () {
            input.classList.add('disabled');
            input.disabled = true;
        }, 0);

        this.dynamicValues['remaining-time'] = 0;
        this.updateDynamicValue('remaining-time');

        this.dynamicValues['status'] = 'Game over !';
        this.updateDynamicValue('status');

        const score = this.score;

        this.score = 0;
        this.dynamicValues['score'] = 0;
    }

    nextWord() {
        const score = this.dynamicValues.score + 1;
        this.dynamicValues['score'] = score;
        this.updateDynamicValue('score');

        this.score = score;
        this.setWord();
        this.resetTimeRemaining();

        const section = document.querySelector('section[data-name="play"]');
        const input = section.querySelector('input[name="user-word"]');
        input.value = '';
    }

    resetTimeRemaining() {
        const secondsLimit = this.secondsLimit;
        this.dynamicValues['remaining-time'] = secondsLimit;
        this.updateDynamicValue('remaining-time');
    }

    enableInputForUser() {
        const section = document.querySelector('section[data-name="play"]');
        const input = section.querySelector('input[name="user-word"]');
        input.addEventListener('keypress', event => {
            const {target, key} = event;
            const {value, selectionStart} = target;
            const word = document.querySelector('span[data-name="guess-word"]').innerHTML;
            let currentValue = value.substring(0, selectionStart) + key + value.substring(selectionStart);
            if (word === currentValue) {
                this.nextWord();
                setTimeout(function () {
                    const position = target.selectionStart;
                    input.value = input.value.substring(0, position - 1) + input.value.substring(position + 1);
                }, 0);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', event => {
    const menuSection = document.querySelector('section[data-name="menu"]');
    const links = menuSection.querySelectorAll('.grid-buttons a');
    for (
        let cursor = 0, cursorMax = links.length;
        cursor < cursorMax;
        cursor++
    ) {
        const link = links[cursor];
        link.addEventListener('click', event => onClickLink(event));
    }
});

function onClickLink(event) {
    event.preventDefault();

    let {target} = event;
    const {nodeName} = target;
    if ('a' !== nodeName.toLowerCase()) target = target.closest('a');

    const {href} = target;

    const menuSection = document.querySelector('section[data-name="menu"]');
    const sectionName = href.substring(href.indexOf("#") + 1);

    const section = document.querySelector(`section[data-name="${sectionName}"]`);
    menuSection.classList.remove('show');

    setTimeout(function () {
        section.classList.add('show');
    }, 0);

    if ('play' === sectionName) {
        initializeTypingGame();
        return;
    }
}
function initializeTypingGame() {
    const section = document.querySelector(`section[data-name="play"]`);

    const typingGame = new TypingGame;

    const inputUserWord = section.querySelector('input[name="user-word"]');
    setTimeout(function() {
        inputUserWord.disabled = false;
        inputUserWord.classList.remove('disabled');
        inputUserWord.value = "";
    }, 0);

}