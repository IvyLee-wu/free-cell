function game() {
    //卡片完成區
    let sortDecks = [[], [], [], []];
    //卡片暫放區(每一格只能放一張)
    let temporaryDecks = [[], [], [], []];
    //主要遊戲區
    let mainDecks = [
        [], //7張
        [],
        [],
        [],
        [], //6張
        [],
        [],
        []
    ];
    //負責儲存回溯的資料
    let undoMove = []

    // 拖曳用配置
    let ondragCard = null  // 負責儲存被抓取卡片的數字
    ondragGroup = null  //負責儲存被抓取卡片所在的排數
    ondragSection = null //負責儲存被抓取卡片所在的區域
    ondragColor = null //負責儲存被抓取卡片的花色
    ondropCard = null   //負責儲存被堆疊的卡片數字
    ondropGroup = null  //負責儲存被堆疊的卡片所在排數
    ondropSection = null //負責儲存被堆疊的卡片所在區域
    ondropColor = null // 負責儲存被堆疊的卡片顏色

    // 遊戲狀態
    isgamePause = false  //遊戲是否停止
    isFinished = false  //卡片是否在完成區
    isTemporary = false //卡片是否在暫放區
    isRefresh = false   //畫面是否刷新

    // 隨機發牌
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let pokerArray = [];
    for (let i = 0; i < 52; i++) {
        pokerArray.push(i + 1)
    }

    let randomCard = shuffle(pokerArray);

    function mainArray() {
        let randomArrayNumber = Math.floor(Math.random() * 8);
        if (randomArrayNumber <= 3) {
            if (mainDecks[randomArrayNumber].length >= 7) {
                return mainArray()
            }
        } else {
            if (mainDecks[randomArrayNumber].length >= 6) {
                return mainArray()
            }
        }
        return randomArrayNumber;
    }

    randomCard.map(function (item) {
        let runMainArray = mainArray();
        mainDecks[runMainArray].push(item);
    });

    function transformNumberToColor(cardNumber) {
        if (cardNumber >= 1 && cardNumber <= 13) {
            return 'spade'
        } else if (cardNumber >= 14 && cardNumber <= 26) {
            return 'heart'
        } else if (cardNumber >= 27 && cardNumber <= 39) {
            return 'diamond'
        } else if (cardNumber >= 40 && cardNumber <= 52) {
            return 'club'
        }
    };

    // 將發牌渲染到畫面上
    let mainGame = document.getElementById('mainGame');

    // 7張牌分成一區，6張牌分成一區
    let cardTwoGroup = [[], []];
    mainDecks.forEach(function (item, index) {
        if (index <= 3) {
            cardTwoGroup[0].push(item);
        } else {
            cardTwoGroup[1].push(item)
        };
    });

    function putCard() {
        cardTwoGroup.forEach(function (section, sectionNum) {
            let cardGroups = document.createElement('div');
            cardGroups.className = 'col-6 d-flex w-100'
            section.forEach(function (item, index) {
                let cardGroup = document.createElement('div');
                cardGroup.className = 'relative w-100 mx-3';
                cardGroup.style.height = '500px'
                cardGroup.group = index;
                cardGroup.section = sectionNum;
                item.forEach(function (el, num) {
                    let oneCard = document.createElement('div');
                    oneCard.className = 'cardArea absolute drop-shadow';
                    oneCard.style.width = '150px';
                    if (!isRefresh) {
                        oneCard.style.transition = 'all .3s'
                        oneCard.style.top = '-1000px';
                        oneCard.style.left = '-2000px';
                        setTimeout(function () {
                            oneCard.style.top = num * 50 + 'px';
                            oneCard.style.left = '0px'
                        }, index * num * 50)
                    } else {
                        oneCard.style.top = num * 50 + 'px';
                        oneCard.style.left = '0px'
                    }
                    let card = document.createElement('img');
                    card.draggable = false
                    card.card = el;
                    card.section = sectionNum;
                    card.group = index;
                    card.color = transformNumberToColor(el)
                    card.src = `img/card/Card_${transformNumberToColor(el)} ${el % 13}.svg`;
                    if (!isgamePause && num + 1 == item.length) {
                        oneCard.draggable = true;
                        card.draggable = true
                    }
                    oneCard.appendChild(card)
                    cardGroup.appendChild(oneCard);
                })
                cardGroups.appendChild(cardGroup)
            })

            mainGame.appendChild(cardGroups);
        });

    };
    putCard();

    //完成牌區渲染
    function sortColor(areaNumber) {
        if (areaNumber == 0) {
            return 'spade'
        } else if (areaNumber == 1) {
            return 'heart'
        } else if (areaNumber == 2) {
            return 'diamond'
        } else if (areaNumber == 3) {
            return 'club'
        }
    }
    let finished = document.getElementById('finished')
    function storefinishCard() {
        sortDecks.forEach(function (item, index) {
            let completedDeck = document.createElement('div');
            completedDeck.className = 'cardArea mx-1 border border-white d-flex justify-content-center align-items-center relative'
            completedDeck.status = 'finished'
            completedDeck.style.backgroundColor = 'rgba(210,210,210,0.4)'
            completedDeck.innerHTML = `<img src="img/${sortColor(index)}-24px.svg" width="30%" style="opacity: 0.8">`
            completedDeck.color = `${sortColor(index)}`
            completedDeck.group = index
            item.forEach(function (el, num) {
                let card = document.createElement('img');
                card.draggable = false
                card.card = el;
                card.status = 'finished';
                card.group = index;
                card.section = ''
                card.className = 'absolute'
                card.style.top = '0px'
                card.style.left = '0px'
                card.color = transformNumberToColor(el);
                card.src = `img/card/Card_${transformNumberToColor(el)} ${el % 13}.svg`;
                completedDeck.appendChild(card)
            })
            finished.appendChild(completedDeck);

        })

    }
    storefinishCard()

    // 暫放牌區渲染
    let temporary = document.getElementById('temporary')
    function storeTemporaryCard() {
        temporaryDecks.forEach(function (item, index) {
            let temporaryDeck = document.createElement('div');
            temporaryDeck.className = 'cardArea mx-1 border border-white';
            temporaryDeck.style.backgroundColor = 'rgba(210,210,210,0.4)'
            temporaryDeck.status = 'temporary'
            temporaryDeck.group = index
            item.forEach(function (el, num) {
                let card = document.createElement('img');
                card.draggable = true
                card.card = el;
                card.status = 'temporary';
                card.group = index;
                card.section = ''
                card.color = transformNumberToColor(el);
                card.src = `img/card/Card_${transformNumberToColor(el)} ${el % 13}.svg`;
                temporaryDeck.appendChild(card);
            })

            temporary.appendChild(temporaryDeck);
        })
    }

    storeTemporaryCard();

    function refresh() {
        isRefresh = true
        finished.innerHTML = ''
        temporary.innerHTML = ''
        mainGame.innerHTML = ''
        putCard();
        storefinishCard();
        storeTemporaryCard();

        let finishalert1 = mainDecks.every(function (item) {
            return item.length === 0
        })
        let finishalert2 = temporaryDecks.every(function (item) {
            return item.length === 0
        })
        if (finishalert1 && finishalert2) {
            alert('恭喜過關!!!!')
        }

    }

    // 清空拖曳變數
    function clearDragAndDrop() {
        ondragSection = null;
        ondragGroup = null;
        ondragColor = null;
        ondropColor = null;
        ondropGroup = null;
        ondropSection = null;
    }

    let goBack = document.getElementById('back')
    goBack.addEventListener('click', Undo)
    function Undo() {
        if (isgamePause) {
            return
        }
        let step = undoMove.pop();
        if (step.active == 'putInTemporary') {
            temporaryDecks[step.to.cardGroup].pop();
            cardTwoGroup[step.from.cardSection][step.from.cardGroup].push(step.from.cardNumber)
        } else if (step.active == 'putInFinish') {
            if (step.from.cardSection === '') {
                sortDecks[step.to.cardGroup].pop();
                temporaryDecks[step.from.cardGroup].push(step.from.cardNumber)
            } else if (step.from.cardSection >= 0) {
                sortDecks[step.to.cardGroup].pop();
                cardTwoGroup[step.from.cardSection][step.from.cardGroup].push(step.from.cardNumber)
            }
        } else if (step.active == 'putInRandom') {
            cardTwoGroup[step.to.cardSection][step.to.cardGroup].pop();
            cardTwoGroup[step.from.cardSection][step.from.cardGroup].push(step.from.cardNumber)
        }
        refresh()
    }

    // bind drag and drop
    function dragStart(e) {
        e.defaultPrevented;
        if (isgamePause) {
            return
        }
        ondragCard = e.target.card;
        ondragGroup = e.target.group;
        ondragSection = e.target.section;
        ondragColor = e.target.color;
    };

    function dragEnter(e) {
        e.defaultPrevented;
        if (e.target.id === 'mainGame') {
            return
        }
        if (e.target.status === 'finished') {
            isFinished = true

        }
        if (e.target.status === 'temporary') {
            isTemporary = true
        }
        ondropCard = e.target.card;
        ondropGroup = e.target.group;
        ondropSection = e.target.section;
        ondropColor = e.target.color;

        if (ondropCard === ondragCard) {
            return
        }
    };

    function dragLeave(e) {
        if (e.target.status !== 'finished' && e.target.status !== 'temporary') {
            isFinished = false;
            isTemporary = false;
        }
        if (e.target.status == 'finished') {
            isFinished = true
            isTemporary = false
        }
        if (e.target.status == 'temporary') {
            isTemporary = true
            isFinished = false
        }
    };

    function dragEnd(e) {
        if (isgamePause) {
            return
        }
        if (isTemporary) {
            if (temporaryDecks[ondropGroup].length == 1) { return };
            undoMove.push({
                from: {
                    cardNumber: ondragCard,
                    cardGroup: ondragGroup,
                    cardSection: ondragSection,
                    cardColor: ondragColor
                },
                to: {
                    cardNumber: ondropCard,
                    cardGroup: ondropGroup,
                    cardSection: ondropSection,
                    cardColor: ondropColor
                },
                active: 'putInTemporary'
            });
            cardTwoGroup[ondragSection][ondragGroup].pop();
            temporaryDecks[ondropGroup].push(ondragCard);
            clearDragAndDrop()
            refresh();
            isTemporary = false
        }

        if (isFinished) {
            if (ondropColor == ondragColor) {
                if ((sortDecks[ondropGroup].length + 1 == ondragCard % 13 || sortDecks[ondropGroup].length - 12 == ondragCard % 13) && temporaryDecks[ondragGroup].indexOf(ondragCard) > -1) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInFinish'
                    });
                    sortDecks[ondropGroup].push(ondragCard);
                    temporaryDecks[ondragGroup].pop();
                    clearDragAndDrop()
                } else if ((sortDecks[ondropGroup].length + 1 == ondragCard % 13 || sortDecks[ondropGroup].length - 12 == ondragCard % 13) && temporaryDecks[ondragGroup].indexOf(ondragCard) < 0) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInFinish'
                    });
                    cardTwoGroup[ondragSection][ondragGroup].pop();
                    sortDecks[ondropGroup].push(ondragCard);
                    clearDragAndDrop()
                }
            }
            isFinished = false
            refresh();
        }


        if (!isTemporary && !isFinished) {
            let dragColor = Math.ceil(ondragCard / 13)
            let dropColor = Math.ceil(ondropCard / 13)
            let rules = dragColor !== dropColor && dragColor + dropColor !== 5 && (ondropCard % 13 == (ondragCard % 13) + 1 || (ondragCard % 13 == 12 && ondropCard % 13 == 0));
            if (rules) {
                if (temporaryDecks[ondragGroup].indexOf(ondragCard) > -1) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInRandom'
                    });
                    temporaryDecks[ondragGroup].pop();
                    cardTwoGroup[ondropSection][ondropGroup].push(ondragCard)
                    clearDragAndDrop()
                } else if (cardTwoGroup[ondragSection][ondragGroup].length > 0) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInRandom'
                    });
                    cardTwoGroup[ondragSection][ondragGroup].pop();
                    cardTwoGroup[ondropSection][ondropGroup].push(ondragCard)
                    clearDragAndDrop()
                }
            } else if (cardTwoGroup[ondropSection][ondropGroup].length == 0) {
                if (temporaryDecks[ondragGroup].indexOf(ondragCard) > -1) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInRandom'
                    });
                    temporaryDecks[ondragGroup].pop();
                    cardTwoGroup[ondropSection][ondropGroup].push(ondragCard)
                    clearDragAndDrop()
                } else if (cardTwoGroup[ondragSection][ondragGroup].length > 0) {
                    undoMove.push({
                        from: {
                            cardNumber: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNumber: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },
                        active: 'putInRandom'
                    });
                    cardTwoGroup[ondragSection][ondragGroup].pop();
                    cardTwoGroup[ondropSection][ondropGroup].push(ondragCard)
                    clearDragAndDrop()
                }
            }
            refresh();
        }
    }

    let container = document.getElementById('container');
    container.addEventListener('dragstart', dragStart);
    container.addEventListener('dragenter', dragEnter);
    container.addEventListener('dragleave', dragLeave);
    container.addEventListener('dragend', dragEnd);

    let restart = document.querySelector('.js-restart')
    restart.addEventListener('click', newGame);
    function newGame() {
        window.location.reload();
    }

    // 暫停
    let timerId = '';
    let startTime = 0;

    let pauseOrPlay = document.getElementById('pauseOrPlay');
    pauseOrPlay.addEventListener('click', changeStatus);
    function changeStatus() {
        isgamePause = !isgamePause
        if (isgamePause == false) {
            startTimer();
            pauseOrPlay.innerHTML = `<div class="bg-light d-flex justify-content-center align-items-center rounded-circle" style="width: 40px; height: 40px;">
            <i class="fas fa-pause blue"></i>
        </div>`
        } else {
            clearInterval(timerId);
            timerId = '';
            pauseOrPlay.innerHTML = `<div class="bg-light d-flex justify-content-center align-items-center rounded-circle" style="width: 40px; height: 40px;">
            <i class="fas fa-play blue"></i>
        </div>`
        }
    }

    let Timer = document.getElementById('timer')
    function startTimer() {
        timerId = setInterval(function () {
            startTime += 1
            let minutes = Math.floor(startTime / 60);
            let seconds = startTime % 60;
            if (minutes < 10) {
                minutes = `0${minutes}`
            }
            if (seconds < 10) {
                seconds = `0${seconds}`
            }
            Timer.textContent = `${minutes}:${seconds}`
        }, 1000)
    }
    startTimer()
}
game()
