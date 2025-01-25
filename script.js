document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.querySelector('.game-area');
  const descriptions = document.querySelectorAll('.description-box');
  const pointsDisplay = document.getElementById('points');
  const resetButton = document.getElementById('reset');
  const progressFill = document.querySelector('.progress-fill');
  
  let points = 0;
  let matches = new Set();

  function shuffleElements(elements) {
    const array = Array.from(elements);
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function shuffleAll() {
    // Separate matched and unmatched items
    const clouds = Array.from(document.querySelectorAll('.cloud'));
    const descriptions = Array.from(document.querySelectorAll('.description-box'));
    
    const matchedPairs = [];
    const unmatchedClouds = [];
    const unmatchedDescriptions = [];
    
    clouds.forEach(cloud => {
      const type = cloud.dataset.type;
      const matchingDesc = descriptions.find(desc => desc.dataset.type === type);
      
      if (matches.has(type)) {
        matchedPairs.push({ cloud, description: matchingDesc });
      } else {
        unmatchedClouds.push(cloud);
        unmatchedDescriptions.push(matchingDesc);
      }
    });
    
    // Clear game area
    gameArea.innerHTML = '';
    
    // First add matched pairs in order
    matchedPairs.sort((a, b) => {
      const order = ['cumulus', 'stratus', 'cirrus', 'cumulonimbus'];
      return order.indexOf(a.cloud.dataset.type) - order.indexOf(b.cloud.dataset.type);
    });
    
    matchedPairs.forEach(pair => {
      const pairDiv = document.createElement('div');
      pairDiv.className = 'cloud-pair';
      pairDiv.appendChild(pair.cloud);
      pairDiv.appendChild(pair.description);
      gameArea.appendChild(pairDiv);
    });
    
    // Then add shuffled unmatched pairs
    const shuffledClouds = shuffleElements(unmatchedClouds);
    const shuffledDescriptions = shuffleElements(unmatchedDescriptions);
    
    for (let i = 0; i < shuffledClouds.length; i++) {
      const pairDiv = document.createElement('div');
      pairDiv.className = 'cloud-pair';
      pairDiv.appendChild(shuffledClouds[i]);
      pairDiv.appendChild(shuffledDescriptions[i]);
      gameArea.appendChild(pairDiv);
    }
    
    // Reset styles for unmatched descriptions
    shuffledDescriptions.forEach(box => {
      box.classList.remove('correct');
      box.style.animation = 'none';
      box.offsetHeight;
    });
  }

  function updateProgress() {
    const progress = (points / 100) * 100;
    progressFill.style.width = `${progress}%`;
  }

  function celebrateMatch() {
    // Center burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Side bursts
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    // Animate score
    pointsDisplay.style.animation = 'none';
    pointsDisplay.offsetHeight; // Trigger reflow
    pointsDisplay.style.animation = 'scoreUpdate 0.5s ease';

    // Shuffle after each correct match
    if (points < 100) { // Don't shuffle on game completion
      setTimeout(shuffleAll, 800); // Delay shuffle to let celebration animation complete
    }
  }

  function showGameComplete() {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Create an object mapping cloud types to their descriptions
    const cloudInfo = {
      cumulus: {
        name: "Cúmulos",
        description: "Nuvens com aparência fofa e amontoada, com base plana e topo arredondado. São comuns em dias ensolarados."
      },
      stratus: {
        name: "Estratos",
        description: "Nuvens em camadas uniformes, acinzentadas, que cobrem todo o céu como um cobertor. Podem produzir chuvisco."
      },
      cirrus: {
        name: "Cirros",
        description: "Nuvens altas, finas e delicadas, com aparência de fios de cabelo. São formadas por cristais de gelo."
      },
      cumulonimbus: {
        name: "Cumulonimbus",
        description: "Nuvens gigantes de tempestade, com grande desenvolvimento vertical. Produzem raios, trovões e chuva forte."
      }
    };

    setTimeout(() => {
      const message = document.createElement('div');
      message.className = 'feedback-message';
      
      let answersHTML = '<div class="answers-grid">';
      for (const [type, info] of Object.entries(cloudInfo)) {
        answersHTML += `
          <div class="answer-card">
            <h3>${info.name}</h3>
            <p>${info.description}</p>
          </div>
        `;
      }
      answersHTML += '</div>';

      message.innerHTML = `
        <h2>Parabéns!</h2>
        <p>Você completou o jogo com sucesso!</p>
        <p>Aqui estão todas as nuvens e suas características:</p>
        ${answersHTML}
        <button onclick="this.parentElement.remove()">Fechar</button>
      `;
      document.body.appendChild(message);
      message.style.display = 'block';
    }, 1000);
  }

  function initializeDragAndDrop() {
    const clouds = document.querySelectorAll('.cloud');
    
    clouds.forEach(cloud => {
      cloud.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', cloud.dataset.type);
        cloud.classList.add('dragging');
      });

      cloud.addEventListener('dragend', () => {
        cloud.classList.remove('dragging');
      });

      cloud.addEventListener('touchstart', (e) => {
        cloud.classList.add('dragging');
      });

      cloud.addEventListener('touchend', () => {
        cloud.classList.remove('dragging');
      });
    });

    descriptions.forEach(box => {
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('highlight');
      });

      box.addEventListener('dragleave', () => {
        box.classList.remove('highlight');
      });

      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('highlight');
        
        const cloudType = e.dataTransfer.getData('text/plain');
        if (cloudType === box.dataset.type && !matches.has(cloudType)) {
          box.classList.add('correct');
          points += 25;
          matches.add(cloudType);
          pointsDisplay.textContent = points;
          updateProgress();
          
          celebrateMatch();
          
          if (points === 100) {
            setTimeout(showGameComplete, 500);
          }
        } else if (!matches.has(box.dataset.type)) {
          box.style.animation = 'none';
          box.offsetHeight;
          box.style.animation = 'shake 0.5s ease';
        }
      });
    });
  }

  // Reset game with animation
  resetButton.addEventListener('click', () => {
    points = 0;
    matches.clear();
    pointsDisplay.textContent = points;
    updateProgress();
    shuffleAll();
  });

  // Initial setup
  shuffleAll();
  initializeDragAndDrop();
  updateProgress();
});
