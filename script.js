// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD3fmiWzxfZ6moBm1AfGb83r58QCgXi7V8",
    authDomain: "team-os-mosqueteiros.firebaseapp.com",
    projectId: "team-os-mosqueteiros",
    storageBucket: "team-os-mosqueteiros.appspot.com",
    messagingSenderId: "714464364802",
    appId: "1:714464364802:web:557248e064c01a13e39a1b"
};


// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referências ao Firestore e Storage
const db = firebase.firestore();
const storage = firebase.storage();

// Elementos do DOM
let input = document.getElementById("input");
let wordDisplay = document.getElementById("word");
let playerNameDisplay = document.getElementById("player-name");
let playerPhotoDisplay = document.getElementById("player-photo");
let scoreDisplay = document.getElementById("score");
let timerDisplay = document.getElementById("timer");

// Variáveis do jogo
let timerInterval;
let score = 0;
let wordsTyped = 0;
let words = [];

// Arrays de palavras
const easyWords = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon"];
const mediumWords = ["avocado", "blackberry", "coconut", "dragonfruit", "guava", "jackfruit", "kiwifruit", "lychee", "mango", "papaya"];
const hardWords = ["boysenberry", "cranberry", "grapefruit", "mulberry", "persimmon", "pineapple", "pomegranate", "raspberry", "starfruit", "watermelon"];
const allWords = easyWords.concat(mediumWords, hardWords);

// Adiciona palavras ao array de jogo
words.push(...allWords.slice(0, 40));

// Exibe a palavra atual
function displayWord() {
    wordDisplay.textContent = currentWord;
}

// Inicia o timer
function startTimer() {
    let timeLeft = 60;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            timerDisplay.textContent = timeLeft;
        } else {
            clearInterval(timerInterval);
            endGame(true);
        }
    }, 1000);
}

// Finaliza o jogo
function endGame() {
    clearInterval(timerInterval);
    input.disabled = true;

    let nickname = playerNameDisplay.textContent;
    let photoUrl = playerPhotoDisplay.src;
    let wordsTypedCount = wordsTyped;
    let score = parseInt(scoreDisplay.textContent);

    // Verifica se já existe um documento com o mesmo nickname
    db.collection("rankings")
        .where("nickname", "==", nickname)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                let playerDoc = querySnapshot.docs[0]; // Assume que só há um documento por nickname
                let currentScore = playerDoc.data().score;
                if (score > currentScore) {
                    // Atualiza o documento existente no ranking com a nova pontuação
                    db.collection("rankings").doc(playerDoc.id).update({
                        photoUrl: photoUrl,
                        wordsTyped: wordsTypedCount,
                        score: score
                    })
                    .then(() => {
                        console.log("Document updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
                    return; // Sai da função para evitar adicionar um novo documento
                }
            }

            // Se não existir um documento com o mesmo nickname ou se a pontuação não for maior, adiciona um novo documento ao ranking
            db.collection("rankings").add({
                nickname: nickname,
                photoUrl: photoUrl,
                wordsTyped: wordsTypedCount,
                score: score
            })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

// Event listener para o formulário do jogador
document.getElementById("player-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let nickname = document.getElementById("nickname").value;
    let photo = document.getElementById("photo").files[0];
    if (!nickname || !photo) {
        alert("Please enter your nickname and upload a photo.");
        return;
    }

    let storageRef = storage.ref();
    let photoRef = storageRef.child('player-photos/' + photo.name);

    photoRef.put(photo).then(function(snapshot) {
        console.log('Uploaded a blob or file!', snapshot);
        photoRef.getDownloadURL().then(function(url) {
            playerNameDisplay.textContent = nickname;
            playerPhotoDisplay.src = url;
            document.getElementById("player-form").style.display = "none";
            document.getElementById("game").style.display = "block";
            startGame();
        });
    }).catch(function(error) {
        console.error('Error uploading file:', error);
    });
});

// Função para iniciar o jogo
function startGame() {
    // Embaralha o array de palavras
    words.sort(() => Math.random() - 0.5);
    
    currentIndex = 0;
    currentWord = words[currentIndex];
    input.disabled = false;
    startTimer();
    displayWord();
}

let currentTypedWord = "";
let isTyping = false;

input.addEventListener("input", function() {
    if (!isTyping) {
        isTyping = true;
        return;
    }

    let typedWord = input.value.trim().toLowerCase();
    let formattedWord = "";

    for (let i = 0; i < typedWord.length; i++) {
        let typedLetter = typedWord.charAt(i);
        let currentLetter = currentWord.charAt(i);

        if (typedLetter === currentLetter) {
            formattedWord += `<span style="color: green;">${typedLetter}</span>`;
        } else {
            endGame(); // Encerra o jogo
            document.getElementById("game-over").style.display = "block"; // Exibe o formulário de GAME OVER
            return;
        }
    }

    wordDisplay.innerHTML = formattedWord;

    if (typedWord === currentWord) {
        currentIndex++;
        if (currentIndex >= words.length) {
            endGame(); // Encerra o jogo
            return;
        }
        currentWord = words[currentIndex];
        input.value = "";
        score++;
        scoreDisplay.textContent = score;
        displayWord();
    }
    else {
        wordDisplay.innerHTML = currentTypedWord + `<span style="color: red;">${currentLetter}</span>` + currentWord.substring(currentTypedWord.length + 1);
        endGame(); // Encerra o jogo
        document.getElementById("game-over").style.display = "block"; // Exibe o formulário de GAME OVER
    }
});

// Botão "Tentar Novamente"
document.getElementById("try-again-btn").addEventListener("click", function() {
    // Mostra a pontuação anterior
    alert(`Pontuação anterior: ${score}`);
    currentIndex = 0;
    currentWord = words[currentIndex];
    currentTypedWord = "";
    input.value = "";
    score = 0;
    scoreDisplay.textContent = score;
    displayWord();
    input.disabled = false;
    document.getElementById("game-over").style.display = "none";
    startTimer();
    wordDisplay.style.color = "black";
    isTyping = false;
});

// Botão "Sair"
document.getElementById("exit-btn").addEventListener("click", function() {
    // Exibe apenas a última pontuação obtida ao sair
    document.getElementById("ranking").innerHTML = `<h2>Última Pontuação</h2><ol><li>${playerNameDisplay.textContent} - Score: ${score}</li></ol>`;
    window.location.href = "index.html";
});

// Variável para controlar se o ranking completo está sendo exibido
let isFullRankingDisplayed = false;

// Exibe o ranking na inicialização da página
function showRanking() {
    db.collection("rankings")
        .orderBy("score", "desc")
        .get()
        .then((querySnapshot) => {
            let rankingHTML = "<h2></h2><ol>";
            let rankCounter = 0;
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                rankingHTML += `<li><img src="${data.photoUrl}" alt="${data.nickname}" width="50" height="50"> ${data.nickname} - Score: ${data.score}</li>`;
                rankCounter++;
                if (rankCounter >= 10 && !isFullRankingDisplayed) {
                    return;
                }
            });
            rankingHTML += "</ol>";
            // Adiciona o botão "Ver Mais" se o ranking não estiver completo
            if (!isFullRankingDisplayed && rankCounter > 10) {
                rankingHTML += "<button onclick='showFullRanking()'>Ver Mais</button>";
            }
            document.getElementById("ranking").innerHTML = rankingHTML;
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

// Exibe o ranking completo
function showFullRanking() {
    isFullRankingDisplayed = true;
    showRanking();
}

// Chama a função showRanking para exibir o ranking na inicialização da página
showRanking();

