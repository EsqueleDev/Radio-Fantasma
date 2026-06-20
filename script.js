let currentSongId = null;
let nomeDoPrograma = "Improviso";
let logoProgramaImagem = "SemPrograma.png";

let installPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => {
            console.log("Service Worker registrado");
        })
        .catch(err => {
            console.error(err);
        });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();

    installPrompt = e;

    document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").addEventListener("click", async () => {
    installPrompt.prompt();

    const result = await installPrompt.userChoice;

    console.log(result.outcome);

    installPrompt = null;
});

navigator.mediaSession.setActionHandler('play', () => player.play());


function checkForAProgramChange(){
    const now = new Date();
    switch(now.getDay()){
        case 3:
            if (now.getHours() >= 22 || now.getHours() < 6){
                nomeDoPrograma = "Viva o Brasil (Explicito)";
                logoProgramaImagem = "Viva_Brasil_Explicito.png";
            }
            else{
                nomeDoPrograma = "Viva o Brasil.";
                logoProgramaImagem = "Viva_Brasil.png";
            }
            break;
        default:
            nomeDoPrograma = "Improviso";
            logoProgramaImagem = "SemPrograma.png";
    }
    
    document.getElementById("logo-programa").src = logoProgramaImagem;

    document.getElementById("logo-programa").onclick = () => openShowInfo(nomeDoPrograma);
}

async function getSongInfo() {
    try {
        const response = await fetch("https://debian.tailf176e0.ts.net/api/nowplaying");
        const result = await response.json();

        const song = result[0].now_playing.song;

        const songId = `${song.artist}-${song.title}`;

        if (songId !== currentSongId) {
            currentSongId = songId;

            document.getElementById("songName").textContent = song.title;

            document.getElementById("tags").innerHTML =
                `<span class="artist-tag" onclick="showAboutArtist('${song.artist.replaceAll("'", "")}')">${song.artist}</span>
                <span class="album-tag" onclick="showAboutAlbum('${song.album.replaceAll("'", "")}', '${song.artist.replaceAll("'", "")}')">${song.album}</span>`;

            document.getElementById("proxima-musica").innerHTML = result[0].playing_next.song.title;

            console.log("Música alterada:", song.title);

            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Radio Fantasma apresenta: ${nomeDoPrograma}`,
                artist: `Musica: ${song.title}. Do: ${song.artist}`,
                album: "HEY WAIT, I GOT A NEW COMPLAIN",
                artwork: [
                    {
                        src: "capa.jpg",
                        sizes: "512x512",
                        type: "image/jpeg"
                    }
                ]
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function tryStartTheFuckingPlayer() {
    const player = document.getElementById("player");
    const warning = document.getElementById("warning");

    try {
        await player.play();
        console.log("AUTOPLAY OK");
    } catch (err) {
        console.log("AUTOPLAY BLOQUEADO");
        console.log(err);

        warning.style.display = "block";
        warning.innerHTML = "<i style='color: var(--warning);'>Clique aqui para começar a ouvir...</i>";

        document.body.addEventListener(
            "click",
            async function startAudio() {
                try {
                    await player.play();

                    warning.style.display = "none";

                    // remove o listener depois que funcionar
                    document.body.removeEventListener("click", startAudio);

                    console.log("PLAYER INICIADO");
                } catch (err) {
                    console.log("Ainda bloqueado:", err);
                }
            },
            { once: true }
        );
    }
}

async function showAboutArtist(artist) {
    if(artist == "Guns N Roses") artist = "Guns N' Roses";
    try {
        const response = await fetch(`https://www.theaudiodb.com/api/v1/json/123/search.php?s=${artist}`);
        const result = await response.json();

        document.getElementById("information").style.display = "block";

        document.getElementById("titulo-informacao").innerHTML = artist;

        document.getElementById("texto-informacao").innerHTML = result.artists[0].strBiographyPT;

        document.getElementById("imagem-info").src = result.artists[0].strArtistThumb;
    } catch (err) {
        console.error(err);
    }
}

async function showAboutAlbum(album, artist) {
    if(artist == "Guns N Roses") artist = "Guns N' Roses";
    try {
        const response = await fetch(`https://www.theaudiodb.com/api/v1/json/123/searchalbum.php?s=${artist}&a=${album}`);
        const result = await response.json();

        console.log(result);
        
        document.getElementById("information").style.display = "block";

        document.getElementById("titulo-informacao").innerHTML = album;

        document.getElementById("texto-informacao").innerHTML = result.album[0].strDescriptionPT;

        document.getElementById("imagem-info").src = result.album[0].strAlbumThumb;
    } catch (err) {
        console.error(err);
    }
}

function openShowInfo(showName){
    document.getElementById("information").style.display = "block";
    switch(showName){
        case 'Improviso':
            document.getElementById("titulo-informacao").innerHTML = "Nenhum Programa";
            document.getElementById("texto-informacao").innerHTML = "Não tem nenhum programa passando agora, curta as musicas da vasta biblioteca de nossa radio.";
            document.getElementById("imagem-info").src = "SemPrograma.png";
            break;

        case 'Viva o Brasil.':
            document.getElementById("titulo-informacao").innerHTML = "Viva o Brasil";
            document.getElementById("texto-informacao").innerHTML = "Tome a sua quarta-feira para aproveitar o mais belo que o nosso pais tem, a musica, vulgo o rock brasileiro, porque de resto...";
            document.getElementById("imagem-info").src = "Viva_Brasil.png";
            break;

        case 'Viva o Brasil (Explicito)':
            document.getElementById("titulo-informacao").innerHTML = "Viva o Brasil (Explicito)";
            document.getElementById("texto-informacao").innerHTML = "Tome a sua quarta-feira para aproveitar o mais belo que o nosso pais tem, a musica, vulgo o rock brasileiro, porque de resto... <i>Este programa pode conter musicas com letras obcenas e de baixo calão, ouçar por sua conta, fones de ouvido indicados, se persistir os sintomas o medico deva ser consultado.</i>";
            document.getElementById("imagem-info").src = "Viva_Brasil_Explicito.png";
            break;
    }
}

function openOptionsMenu(){
    document.getElementById("menu-options").style.display = "block";
}

function openSettingsMenu(){
    document.getElementById("menu-options").style.display = "none";
    document.getElementById("menu-settings").style.display = "block";
}

function changeTheme(){
    const themeSelector = document.getElementById("theme-selector");
    localStorage.setItem("theme", themeSelector.value);
    
    let styleSheetURL = 'estilos.css';
    
    switch (themeSelector.value){
        case "0":
            styleSheetURL = 'estilos.css';
            break;

        case "1":
            styleSheetURL = 'estilos _frutiger_aero.css';
            break;
    }

    document.getElementById("stylesheet").href = styleSheetURL;

    console.log(themeSelector.value);
}

tryStartTheFuckingPlayer();
checkForAProgramChange();

function getThemeSaved(){
    let styleSheetURL = 'estilos.css';
    
    switch (localStorage.getItem("theme")){
        case "0":
            styleSheetURL = 'estilos.css';
            break;

        case "1":
            styleSheetURL = 'estilos _frutiger_aero.css';
            break;
    }

    document.getElementById("theme-selector").value = localStorage.getItem("theme");

    document.getElementById("stylesheet").href = styleSheetURL;
}

async function checkTheTodayProgram(today){
    try {
        const response = await fetch('./programacao.json');

        if(!response.ok) throw new Error("caralho tu fudeu o bagulho que ta na mesma pasta");

        const data = await response.json();

        const today_program = data[today];
        
        changeProgramsToday(today_program);

        let tommorrow_program;

        if(today == 6){
            tommorrow_program = data[0];
        }
        else{
            tommorrow_program = data[today+1];
        }
        changeProgramsTommorow(tommorrow_program);
    } catch (err){
        console.error(err);
    }
}

function changeProgramsToday(programation){
    document.getElementById("programa-1").innerHTML = `
        <h2>${programation.programaDiario.nomePrograma}</h2>
        <br><hr><br>
        <h3>${programation.programaDiario.descricao}</h3><br>
        <h4><i>Começa as: ${programation.programaDiario.horarioComeco}. Termina as: ${programation.programaDiario.horarioFim}</i></h4>
    `;

    document.getElementById("programa-2").innerHTML = `
        <h2>${programation.programaNoturno.nomePrograma}</h2>
        <br><hr><br>
        <h3>${programation.programaNoturno.descricao}</h3><br>
        <h4><i>Começa as: ${programation.programaNoturno.horarioComeco}. Termina as: ${programation.programaNoturno.horarioFim}</i></h4>
    `;
}

function changeProgramsTommorow(programation){
    document.getElementById("programa-3").innerHTML = `
        <h2>${programation.programaDiario.nomePrograma}</h2>
        <br><hr><br>
        <h3>${programation.programaDiario.descricao}</h3><br>
        <h4><i>Começa as: ${programation.programaDiario.horarioComeco}. Termina as: ${programation.programaDiario.horarioFim}</i></h4>
    `;

    document.getElementById("programa-4").innerHTML = `
        <h2>${programation.programaNoturno.nomePrograma}</h2>
        <br><hr><br>
        <h3>${programation.programaNoturno.descricao}</h3><br>
        <h4><i>Começa as: ${programation.programaNoturno.horarioComeco}. Termina as: ${programation.programaNoturno.horarioFim}</i></h4>
    `;
}

function openProgramationContainer(){
    document.getElementById("menu-options").style.display = "none";
    document.getElementById("programing").style.display = "block";
    const today = new Date();
    
    checkTheTodayProgram(today.getDay());
}

function openMessageContainer(){
    document.getElementById("menu-options").style.display = "none";
    document.getElementById("sendMessage").style.display = "block";
}

async function sendMessageForUs(){
    try{
        const response = await fetch("https://example.org/post", {
            method: "POST",
            body: JSON.stringify({ username: "example" }),
        });

        if(!response.ok){
            console.log("FUDEU");
        }
   } catch (err){
        console.log(err);
    }
}

getThemeSaved();

getSongInfo();
setInterval(getSongInfo, 6000);
setInterval(checkForAProgramChange, 60000);