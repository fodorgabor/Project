let currentPage = 0;
const gamesPerPage = 100;
let allGames = [];

const submitBtn = document.querySelector('#submit_steamID');
submitBtn.onclick = loadGames;

const submitGamesBtn = document.querySelector('#submit_Games');
submitGamesBtn.onclick = searchGames;

async function searchGames() {
    const query = document.getElementById('search_Games').value.trim();

    if (!query) return;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('Nincs találat.');
        }

        // Az Apify eredményeket átalakítja a meglévő formátumra
        allGames = data.results.map(item => ({
            appid: item.appId,        // ← Apify mező neve lehet más!
            name: item.title || item.name,
        }));

        currentPage = 0;
        displayPage(currentPage);

    } catch (error) {
        const err = document.getElementById('error_message_id');
        err.textContent = 'Hiba: ' + error.message;
        err.style.display = 'block';
    }
}

async function loadGames() {
    const steamid = document.getElementById('search_steamID').value;

    try {
        const response = await fetch(`/api/steam_all?steamid=${steamid}`);
        const data = await response.json();

        if (!data.response || !data.response.games) {
            throw new Error(data.error || 'Nem található játék a megadott Steam ID-hez.');
        }

        allGames = data.response.games;
        currentPage = 0;
        displayPage(currentPage);

        document.getElementById('error_message_id').style.display = 'none';

    } catch (error) {
        console.error('Error:', error);
        const err = document.getElementById('error_message_id');
        err.textContent = 'Hiba: ' + error.message;
        err.style.display = 'block';
    }
}

function displayPage(page) {
    const library = document.querySelector('.library');
    library.innerHTML = '';

    const start = page * gamesPerPage;
    const end = start + gamesPerPage;
    const gamesToShow = allGames.slice(start, end);

    gamesToShow.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game';

        gameDiv.innerHTML = `
            <img src="https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg" alt="${game.name}">
            <div class="title">${game.name}</div>
            <a href="https://store.steampowered.com/app/${game.appid}/" target="_blank" class="btn">
                Steam oldal megtekintése
            </a>
        `;

        library.appendChild(gameDiv);
    });

    // Pagination
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    if (page > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Előző';
        prevBtn.onclick = () => {
            currentPage--;
            displayPage(currentPage);
        };
        paginationDiv.appendChild(prevBtn);
    }

    if (end < allGames.length) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Tovább';
        nextBtn.onclick = () => {
            currentPage++;
            displayPage(currentPage);
        };
        paginationDiv.appendChild(nextBtn);
    }

    library.appendChild(paginationDiv);
}