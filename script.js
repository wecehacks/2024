const cards = document.querySelectorAll(".card");
let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;
function flipCard({target: clickedCard}) {
    if(cardOne !== clickedCard && !disableDeck) {
        clickedCard.classList.add("flip");
        if(!cardOne) {
            return cardOne = clickedCard;
        }
        cardTwo = clickedCard;
        disableDeck = true;
        let cardOneImg = cardOne.querySelector(".back-view img").src,
        cardTwoImg = cardTwo.querySelector(".back-view img").src;
        var oneName = cardOneImg.replace(/^.*[\\\/]/, '');
        var twoName = cardTwoImg.replace(/^.*[\\\/]/, '');
        matchCards(oneName, twoName);
        console.log(oneName);
        console.log(twoName);
        
    }
}
function matchCards(img1, img2) {
    str1 = img1.substring(0, img1.length-4);
    num1 = parseInt(str1);
    str2 = img2.substring(0, img2.length-4);
    num2 = parseInt(str2);
    console.log(str1);
    console.log(num1);
    if ( (num1%2!=0 && num2 == num1+1) || (num1%2==0 && num2 == num1-1)) {
    // if(img1 === img2) {
        matched++;
        if(matched == 8) {
            setTimeout(() => {
                return shuffleCard();
            }, 1000);
        }
        cardOne.removeEventListener("click", flipCard);
        cardTwo.removeEventListener("click", flipCard);
        cardOne = cardTwo = "";
        return disableDeck = false;
    }
    setTimeout(() => {
        cardOne.classList.add("shake");
        cardTwo.classList.add("shake");
    }, 400);
    setTimeout(() => {
        cardOne.classList.remove("shake", "flip");
        cardTwo.classList.remove("shake", "flip");
        cardOne = cardTwo = "";
        disableDeck = false;
    }, 1200);
}
function shuffleCard() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    arr.sort(() => Math.random() > 0.5 ? 1 : -1);
    cards.forEach((card, i) => {
        card.classList.remove("flip");
        let imgTag = card.querySelector(".back-view img");
        imgTag.src = `img/cards/${arr[i]}.png`;
        card.addEventListener("click", flipCard);
    });
}
shuffleCard();
    
cards.forEach(card => {
    card.addEventListener("click", flipCard);
});