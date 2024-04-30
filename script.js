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
let photoFrame = document.querySelector('.photo-frame');

// Variáveis do jogo
let timerInterval;
let score = 0;
let wordsTyped = 0;
let correctWordsTyped = 0; // Contador de palavras corretas digitadas
let words = [];
let isTryingAgain = false;

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

// Função para verificar se o jogador não errou nenhuma palavra até o final dos 60 segundos
function checkNoMistakes() {
    if (correctWordsTyped === wordsTyped) {
        alert(`Parabéns! Você acertou todas as ${correctWordsTyped} palavras no tempo de 60 segundos.`);
    }
}

// Função para contar e exibir as palavras corretas ao final do jogo
function displayCorrectWordsCount() {
    alert(`Você acertou ${correctWordsTyped} palavras no tempo de 60 segundos.`);
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
            displayCorrectWordsCount(); // Exibe a contagem de palavras corretas ao final dos 60 segundos
        }
    }, 1000);
}

// Finaliza o jogo
function endGame() {
    clearInterval(timerInterval);
    input.disabled = true;

    if (!isTryingAgain) {
        let nickname = playerNameDisplay.textContent;
        let photoUrl = playerPhotoDisplay.src;
        let wordsTypedCount = wordsTyped; // Alterado para contabilizar corretamente as palavras digitadas
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
                            wordsTyped: wordsTypedCount, // Atualiza o número de palavras digitadas
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
                    wordsTyped: wordsTypedCount, // Adiciona o número de palavras digitadas
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
}

// Event listener para o formulário do jogador
document.getElementById("player-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let nickname = document.getElementById("nickname").value;
    let photo = document.getElementById("photo").files[0];
    if (!nickname || !photo) {
        alert("Por favor, digite seu apelido e carregue uma foto.");
        return;
    }

    // Verifica se o nickname já está cadastrado
    db.collection("rankings")
        .where("nickname", "==", nickname)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                alert("Nickname já está em uso, escolha outro.");
                return;
            }

            // Se o nickname não estiver cadastrado, continua com o processo de cadastro
            let storageRef = storage.ref();
            let photoRef = storageRef.child('player-photos/' + photo.name);

            photoRef.put(photo).then(function (snapshot) {
                console.log('Uploaded a blob or file!', snapshot);
                photoRef.getDownloadURL().then(function (url) {
                    playerNameDisplay.textContent = nickname;
                    playerPhotoDisplay.src = url;
                    document.getElementById("player-form").style.display = "none";
                    document.getElementById("game").style.display = "block";
                    startGame();
                });
            }).catch(function (error) {
                console.error('Error uploading file:', error);
            });
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
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

input.addEventListener("input", function () {
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
        correctWordsTyped++; // Incrementa o contador de palavras corretas digitadas
        displayWord();
    }
    else {
        wordDisplay.innerHTML = currentTypedWord + `<span style="color: red;">${currentLetter}</span>` + currentWord.substring(currentTypedWord.length + 1);
        endGame(); // Encerra o jogo
        document.getElementById("game-over").style.display = "block"; // Exibe o formulário de GAME OVER
    }
});

// Botão "Tentar Novamente"
document.getElementById("try-again-btn").addEventListener("click", function () {
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
    correctWordsTyped = 0; // Reinicia o contador de palavras corretas digitadas

    // Verifica se a pontuação atual é maior do que a pontuação anterior no ranking
    db.collection("rankings")
        .where("nickname", "==", playerNameDisplay.textContent)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                let playerDoc = querySnapshot.docs[0];
                let currentScore = playerDoc.data().score;
                if (score > currentScore) {
                    // Atualiza a pontuação no ranking
                    db.collection("rankings").doc(playerDoc.id).update({
                        score: score
                    })
                        .then(() => {
                            console.log("Document updated successfully.");
                        })
                        .catch((error) => {
                            console.error("Error updating document: ", error);
                        });
                }
            }
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
});


// Botão "Sair"
document.getElementById("exit-btn").addEventListener("click", function () {
    isTryingAgain = false; // Define que o jogador não está tentando novamente
    endGame(); // Finaliza o jogo
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
        .limit(10) // Limita a exibição aos 10 primeiros colocados
        .onSnapshot((querySnapshot) => { // Atualiza o ranking em tempo real
            let rankingHTML = "<ol>";
            let position = 1;
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let frameUrl;
                if (position === 1) {
                    frameUrl = "1lugar.png";
                } else if (position === 2) {
                    frameUrl = "2lugar.png";
                } else if (position === 3) {
                    frameUrl = "3lugar.png";
                } else {
                    frameUrl = "4lugaremdiante.png";
                }
                rankingHTML += `<li><img class="frame" src="${frameUrl}" alt="Frame"><img class="player-photo" src="${data.photoUrl}" alt="${data.nickname}" width="50" height="50"> ${data.nickname} - ${data.score}</li>`;
                position++;
            });
            rankingHTML += "</ol>";
            // Adiciona o botão "Ver Mais" se o ranking não estiver completo
            if (!isFullRankingDisplayed) {
                rankingHTML += "<button onclick='showFullRanking()'>Ver Mais</button>";
            }
            document.getElementById("ranking").innerHTML = rankingHTML;
        });
}

// Exibe o ranking completo
function showFullRanking() {
    isFullRankingDisplayed = true;
    showRanking();
}

// Chama a função showRanking para exibir o ranking na inicialização da página
showRanking();

document.querySelectorAll('#ranking-list li').forEach(item => {
    item.addEventListener('mouseover', () => {
        const score = item.querySelector('strong').textContent;
        item.querySelector('span').textContent = score;
    });

    item.addEventListener('mouseout', () => {
        const playerName = item.querySelector('span').getAttribute('data-player');
        item.querySelector('span').textContent = playerName;
    });
});
