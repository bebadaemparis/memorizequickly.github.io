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
let previousScore = 0;
let timerInterval;
let score = 0;
let wordsTyped = 0;
let correctWordsTyped = 0;
let words = [];
let isTryingAgain = false;

// Arrays de palavras
const easyWords = [
    "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon",
    "mango", "orange", "papaya", "peach", "pear", "quince", "raspberry", "strawberry", "tangerine", "watermelon",
    "apricot", "blueberry", "cantaloupe", "coconut", "grapefruit", "guava", "kiwifruit", "lychee", "nectarine", "pineapple",
    "plum", "pomegranate", "cranberry", "blackberry", "boysenberry", "mulberry", "starfruit", "persimmon", "passionfruit", "dragonfruit",
    "plantain", "apricot", "avocado", "clementine", "kumquat", "persimmon", "quince", "tamarind", "acerola", "ackee",
    "breadfruit", "longan", "rambutan", "soursop", "guanabana", "ugli fruit", "durian", "horned melon", "jackfruit", "sapodilla",
    "feijoa", "kiwano", "pawpaw", "salak", "canistel", "jabuticaba", "santol", "cupuaçu", "chayote", "tomatillo",
    "damson", "loganberry", "marionberry", "boysenberry", "lingonberry", "cloudberry", "huckleberry", "elderberry", "açaí berry", "goji berry",
    "bilberry", "crowberry", "seaberry", "currant", "barberry", "gooseberry", "winterberry", "beautyberry", "coralberry", "snowberry",
    "hackberry", "buffalo berry", "bearberry", "cranberry", "lingonberry", "bilberry", "hawthorn", "rowanberry", "chokeberry", "cloudberry"
];
const mediumWords = [
    "algorithm", "asynchronous", "bitmap", "buffer", "boolean", "callback", "class", "compiler", "concatenate", "debugging",
    "framework", "frontend", "hash", "iteration", "middleware", "modular", "namespace", "object", "parameter", "prototype",
    "recursion", "scripting", "stack", "syntax", "variable", "agile", "backend", "binary", "cache", "closure",
    "component", "datatype", "deprecated", "encapsulation", "exception", "function", "immutable", "inheritance", "interface",
    "library", "method", "module", "polymorphism", "scope", "server", "thread", "transpile", "debugger", "pointer",
    "semicolon", "statement", "subroutine", "synchronous", "token", "tree", "tuple", "abstraction", "argument", "bootstrap",
    "canvas", "dependency", "directive", "dynamically", "interpolation", "lifecycle", "minification", "observable", "refactoring",
    "rendering", "singleton", "template", "transpiler", "virtual", "websockets", "iteration", "middleware", "modular", "namespace",
    "object", "parameter", "prototype", "recursion", "scripting", "stack", "syntax", "variable", "agile", "backend",
    "binary", "cache", "closure", "component", "datatype", "deprecated", "encapsulation", "exception", "function", "immutable",
    "inheritance", "interface", "library", "method", "module", "polymorphism", "scope", "server", "thread", "transpile"
];

const hardWords = [
    "algorithms", "automation", "back-end", "cloud", "cybersecurity", "data", "encryption", "frameworks", "functions", "integration",
    "machine learning", "microservices", "networking", "optimization", "scalability", "serverless", "solutions", "streaming", "virtualization", "web development",
    "authentication", "authorization", "blockchain", "cryptography", "distributed systems", "docker", "elasticity", "front-end", "load balancing", "monitoring",
    "multithreading", "parallel computing", "performance", "redundancy", "resilience", "sandboxing", "testing", "abstraction", "anomaly detection", "artificial intelligence",
    "augmented reality", "big data", "biometrics", "cluster computing", "computer vision", "data mining", "deep learning", "digital twin", "edge computing",
    "federated learning", "fog computing", "quantum computing", "reinforcement learning", "robotics", "self-driving cars", "smart contracts", "speech recognition", "virtual reality",
    "cyber-physical systems", "edge analytics", "explainable AI", "federated analytics", "intelligent automation", "predictive analytics", "quantum cryptography", "quantum machine learning", "swarm intelligence", "zero-knowledge proofs",
    "algorithmic trading", "computational genomics", "cryptocurrency", "differential privacy", "homomorphic encryption", "natural language processing", "neuromorphic computing", "quantum algorithms", "quantum teleportation", "reservoir computing",
    "semantic web", "speech synthesis", "supervised learning", "unsupervised learning", "variational inference", "visual analytics", "web scraping", "adversarial machine learning", "ambient intelligence", "autonomous robotics",
    "bioinformatics", "brain-computer interface", "chaos engineering", "context-aware computing", "emotion recognition", "explainable AI", "machine ethics", "nanotechnology", "sentiment analysis", "smart grids"
];
const allWords = easyWords.concat(mediumWords, hardWords);


// todas as palavras
words.push(...allWords);



// Função para verificar se o jogador não errou nenhuma palavra até o final dos 180 segundos
function checkNoMistakes() {
    if (correctWordsTyped === wordsTyped) {
        alert(`Parabéns! Você acertou todas as ${correctWordsTyped} palavras no tempo de 180 segundos.`);
    }
}

// Função para contar e exibir as palavras corretas ao final do jogo
function displayCorrectWordsCount() {
    alert(`Você acertou ${correctWordsTyped} palavras no tempo de 180 segundos.`);
}

// Inicia o timer
function startTimer() {
    let timeLeft = 180;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            timerDisplay.textContent = timeLeft;
        } else {
            clearInterval(timerInterval);
            endGame(true);
            displayCorrectWordsCount(); // Exibe a contagem de palavras corretas ao final dos 180 segundos
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
//função bloqueia do teclado o backspace
input.addEventListener("keydown", function(event) {
    if (event.key === "Backspace") {
        event.preventDefault();
    }
});


// Função para embaralhar um array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Função para iniciar o jogo
function startGame() {
    // Embaralha o array de palavras
    shuffleArray(words);

    currentIndex = 0;
    currentWord = words[currentIndex];
    input.disabled = false;
    startTimer();
    displayWord();
}

//começo
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
            playIncorrectSound();
            wordDisplay.innerHTML = currentTypedWord + `<span style="color: red;">${currentLetter}</span>` + currentWord.substring(currentTypedWord.length + 1);
            endGame(); // Encerra o jogo apenas quando a palavra digitada estiver completamente errada
            document.getElementById("game-over").style.display = "block"; // Exibe o formulário de GAME OVER
            return;
        }
    }

    currentTypedWord = typedWord;
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
});
//fim

    

// Seleciona os elementos de áudio
const correctSound = new Audio('sons/certa.wav');
const incorrectSound = new Audio('sons/errada.mp3');

// Ao acertar uma palavra
function playCorrectSound() {
    correctSound.currentTime = 0; // Reinicia o áudio se já estiver tocando
    correctSound.play();
}

// Ao errar uma palavra
function playIncorrectSound() {
    incorrectSound.currentTime = 0; // Reinicia o áudio se já estiver tocando
    incorrectSound.play();
}


// Botão "Tentar Novamente"
document.getElementById("try-again-btn").addEventListener("click", function () {
    // Mostra a pontuação anterior
    alert(`Pontuação anterior: ${previousScore}`);
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

// Finaliza o jogo
function endGame() {
    clearInterval(timerInterval);
    input.disabled = true;

    if (!isTryingAgain && score > previousScore) {
        let nickname = playerNameDisplay.textContent;
        let photoUrl = playerPhotoDisplay.src;
        let wordsTypedCount = wordsTyped; // Alterado para contabilizar corretamente as palavras digitadas

        // Atualiza a pontuação anterior do jogador
        previousScore = score;

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


// Botão "Sair"
document.getElementById("exit-btn").addEventListener("click", function () {
    isTryingAgain = false; 
    endGame(); 
// Exibe apenas a última pontuação obtida ao sair
    document.getElementById("ranking").innerHTML = `<h2>Última Pontuação</h2><ol><li>${playerNameDisplay.textContent} - Score: ${score}</li></ol>`;
    window.location.href = "index.html";
});

// Variável para controlar se o ranking completo está sendo exibido
let isFullRankingDisplayed = false;





//função para mostrar o
function showRanking() {
    db.collection("rankings")
        .orderBy("score", "desc")
        .limit(10)
        .onSnapshot((querySnapshot) => {
            let rankingHTML = "";
            let position = 1;
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let frameClass = getFrameClass(position);
                rankingHTML += `
                    <tr>
                        <td>${position}</td>
                        <td><img class="frame ${frameClass}" src="borda${position}lugar.png" alt="Frame"></td>
                        <td><div class="player-photo-frame ${frameClass}"><img class="player-photo" src="${data.photoUrl}" alt="${data.nickname}" width="50" height="50"></div></td>
                        <td>${data.nickname}</td>
                        <td>${data.score}</td>
                    </tr>`;
                position++;
            });
            document.getElementById("ranking").innerHTML = rankingHTML;
        });
}

//função para exibir as molduras
//funçaode molduras
function getFrameClass(position) {
    if (position === 1) {
        return "first-place";
    } else if (position === 2) {
        return "second-place";
    } else if (position === 3) {
        return "third-place";
    } else {
        return "default-frame";
    }
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

function displayWord() {
    wordDisplay.textContent = currentWord;
    wordDisplay.style.color = "white";
    wordDisplay.style.fontSize = "2em"; // Ajuste o tamanho da fonte conforme necessário
    wordDisplay.style.textAlign = "center";

    // Toca o som de acerto quando a palavra é exibida
    playCorrectSound();
}