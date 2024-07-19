console.log("Welcome");

let currentSong = new Audio();
let songs = [];

async function getSongs(folder) {
  let a = await fetch(`http://127.0.0.1:3000/spotify/Spotify_Clone/songs/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let i = 0; i < as.length; i++) {
    const elem = as[i];
    if (elem.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(elem.href));
    }
  }
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = '';
  for (const song of songs) {
    songUL.innerHTML += `<li>
                <img src="icons/musik.svg" alt="" class="invert" />
                <div class="info">
                  <div class="bold">${song.split("/").pop().replaceAll("%20", " ")}</div>
                  <div>Artist</div>
                </div>
              </li>`;
  }
  
  // Event listener to play each track when clicked
  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      let music = e.querySelector(".info .bold").innerHTML.trim();
      let track = songs.find(s => s.includes(music));
      playMusic(track);
      document.getElementById("play").src = "icons/pause.svg"; // Change play button to pause when a song is clicked
    });
  });

  return songs;
}

async function getAlbums(){
  let a = await fetch(`http://127.0.0.1:3000/spotify/Spotify_Clone/songs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  console.log(div);
  let hrefs = div.getElementsByTagName("a")
  //console.log(hrefs)
  let arr = Array.from(hrefs)
  for(let i = 0; i < arr.length; i++) {
    const e = arr[i];
    if(e.href.includes("/songs")){
      let folder = e.href.split("/").slice(-2)[0].replaceAll("%20", " ");
      let a = await fetch(`http://127.0.0.1:3000/spotify/Spotify_Clone/songs/${folder}/info.json`);
      let response = await a.json();
      let cardContainer = document.querySelector(".card-container");

      cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
      <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  color="#000000"
                  fill="none"
                  id="play"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                    fill="#000000"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="http://127.0.0.1:3000/spotify/Spotify_Clone/songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`

    }
  }
  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async (item)=>{
      //console.log(e.innerHTML);
      let album = item.currentTarget.dataset.folder;
      songs = await getSongs(`${album}`)
    })

  })

}

function convertSecondsToMinutes(seconds) {
  // Calculate the minutes and seconds
  const minutes = Math.round(Math.floor(seconds / 60));
  const remainingSeconds = Math.round(seconds % 60);

  // Pad with leading zeros if necessary
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return the formatted string
  return `${paddedMinutes}:${paddedSeconds}`;
}

const playMusic = (track, paused=false) => {
  console.log("Playing track:", track);
  currentSong.src = track;
  if(!paused){
    currentSong.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  }
  let name = track.split("/").pop().replaceAll("%20", " ");
  document.querySelector(".songInfo").innerHTML = name;
  document.querySelector(".songTime").innerHTML = "00:00";
};

// const showSongs = ()=>{
//   for (const song of songs) {
//     songUL.innerHTML += `<li>
//                 <img src="musik.svg" alt="" class="invert" />
//                 <div class="info">
//                   <div class="bold">${song.split("/").pop().replaceAll("%20", " ")}</div>
//                   <div>Artist</div>
//                 </div>
//               </li>`;
//   }
// }

async function main() {
  //songs = await getSongs("X&Y");
  // playMusic(songs[0], true);
  //show songs  
  
  getAlbums();
  //event listener to play and pause each song
  let playButton = document.getElementById("playButton");
  playButton.addEventListener("click",()=>{

    if(currentSong.paused){
      playButton.src = "icons/pause.svg";
      currentSong.play();
    }
    else{
      currentSong.pause();
      playButton.src = "icons/play.svg";  
    }
  })

  //event listener to update time
  currentSong.addEventListener("timeupdate", ()=>{
    //console.log(currentSong.currentTime, currentSong.duration)
    document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} 
                                                      / ${convertSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";  
  })

  //seekbar listening
  document.querySelector(".seekbar").addEventListener("click", (e)=>{
    let dur = (e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left = (e.offsetX/e.target.getBoundingClientRect().width)*100 + "%";
    currentSong.currentTime = (currentSong.duration* dur) / 100;
  })

  //prev, next listeners
  let prev = document.getElementById("prev");
  let next = document.getElementById("next");
  
  prev.addEventListener("click",()=>{
    let index = songs.indexOf(decodeURIComponent(currentSong.src));
    //wraps around the array so that last song is played when prev pressed on first song
    let prevIndex = (index - 1 + songs.length) % songs.length; 
    playMusic(songs[prevIndex]);
    playButton.src = "icons/pause.svg";
  });

  next.addEventListener("click",()=>{
    let index = songs.indexOf(decodeURIComponent(currentSong.src));
    playMusic(songs[index+1]); 
    playButton.src = "icons/pause.svg";
  });

  //activate hamburger
  document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0";
  })

  //deactivate hamburger
  document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-100%";
  })

  //set volume of song
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    currentSong.volume = parseInt(e.target.value)/100;
  })
  
  document.querySelector(".volume img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg");
      currentSong.volume = .30;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
    }
  })
}

main();