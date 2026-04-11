let currentPage = 0;
const gamesPerPage = 50;
let allGames = [];
const submitBtn = document.querySelector('#submit');
submitBtn.onclick = loadGames;



async function loadGames() {
    const steamid = document.getElementById('search').value; // Steam ID
    try {
        const response = await fetch(`/api/steam?steamid=${steamid}`);
        const text = await response.text();

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${text}`);
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            throw new Error(`Invalid JSON from server: ${parseError.message}. Response: ${text}`);
        }

        if (!data.response || !data.response.games) {
            throw new Error(data.error || 'No games found');
        }
        allGames = data.response.games;
        displayPage(currentPage);
    } catch (error) {
        console.error('Error loading games:', error);
        document.querySelector('.library').innerHTML = '<p>Hiba: ' + error.message + '</p>';
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
            <img src="https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg" alt="${game.name}" loading="lazy">
            <div class="title">${game.name}</div>
            <a href="https://store.steampowered.com/app/${game.appid}/" target="_blank" class="btn">Steam oldal <br> megtekintése</a>
        `;
        library.appendChild(gameDiv);
    });

    // Lapozás gombok
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

loadGames();
submitBtn.onclick = loadGames;