document.addEventListener('DOMContentLoaded', () => {
  const homeContainer = document.getElementById('home-container');
  const topicContainer = document.getElementById('topic-container');

  if (homeContainer) {
    fetch('/api/topics')
      .then(res => res.json())
      .then(topics => {
        if (topics.length === 0) {
          homeContainer.innerHTML = '<p>Nessun argomento trovato. Aggiungi file JSON in /data.</p>';
        }
        topics.forEach(t => {
          const card = document.createElement('a');
          card.className = 'topic-card';
          card.href = `topic.html?id=${t.id}`;
          card.innerHTML = `<h3>${t.title}</h3><p>${t.description}</p>`;
          homeContainer.appendChild(card);
        });
      })
      .catch(err => console.error('Errore:', err));
  }

  if (topicContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('id');

    if (!topicId) {
      document.getElementById('topic-title').textContent = 'Errore';
      document.getElementById('topic-desc').textContent = 'Nessun argomento selezionato nell\'URL.';
      return;
    }

    fetch(`/api/topics/${topicId}`)
      .then(res => {
        if (!res.ok) throw new Error('Argomento non trovato');
        return res.json();
      })
      .then(topic => {
        document.getElementById('topic-title').textContent = topic.title;
        document.getElementById('topic-desc').textContent = topic.description;

        const listEl = document.getElementById('items-list');
        const counterEl = document.getElementById('counter');
        document.getElementById('total').textContent = topic.items.length;

        let foundCount = 0;

        const itemsToGuess = topic.items.map(item => ({
          name: item,
          guessed: false
        }));

        function renderList() {
          listEl.innerHTML = '';
          itemsToGuess.forEach(item => {
            const li = document.createElement('li');
            li.className = item.guessed ? 'guessed' : 'hidden-item';
            li.textContent = item.guessed ? item.name : '???';
            listEl.appendChild(li);
          });
          counterEl.textContent = foundCount;
        }

        renderList();

        const inputEl = document.getElementById('guess-input');

        inputEl.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;

          const guess = e.target.value.trim().toLowerCase();
          let found = false;

          itemsToGuess.forEach(item => {
            if (!item.guessed && item.name.toLowerCase() === guess) {
              item.guessed = true;
              foundCount++;
              found = true;
            }
          });

          if (found) {
            inputEl.value = '';
            renderList();

            if (foundCount === itemsToGuess.length) {
              inputEl.placeholder = "Completato! Ottimo lavoro.";
              inputEl.disabled = true;
            }
          } else {
            inputEl.value = '';
          }
        });
      })
      .catch(_ => {
        document.getElementById('topic-title').textContent = 'Error 404';
        document.getElementById('topic-desc').textContent = 'Impossibile trovare i dati dell\'argomento.';
      });
  }
});
