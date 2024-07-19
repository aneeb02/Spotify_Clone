console.log("Welcome");

let currentSong = new Audio();
let songs = [];

async function getSongs(folder) {
  let a = await fetch(`http://127.0.0.1:3000/spotify/Spotify_Clone/${folder}/`);
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
                <img src="musik.svg" alt="" class="invert" />
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
      document.getElementById("play").src = "play.svg"; // Change play button to pause when a song is clicked
    });
  });

  return songs;
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
  console.log(songs);
  //show songs  
  

  //event listener to play and pause each song
  let playButton = document.getElementById("playButton");
  playButton.addEventListener("click",()=>{

    if(currentSong.paused){
      playButton.src = "pause.svg";
      currentSong.play();
    }
    else{
      currentSong.pause();
      playButton.src = "play.svg";  
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
    playButton.src = "pause.svg";
  });

  next.addEventListener("click",()=>{
    let index = songs.indexOf(decodeURIComponent(currentSong.src));
    playMusic(songs[index+1]); 
    playButton.src = "pause.svg";
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

  //load playlist upon clicking a card
  // Array.from(document.getElementsByClassName("card")[0].addEventListener("click", (e)=>{
  //   console.log(e);
   
  // }))

  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    console.log(e);
    e.addEventListener("click",async (item)=>{
      //console.log(e.innerHTML);
      console.log(item.currentTarget.dataset);
      let album = item.currentTarget.dataset.folder;
      songs = await getSongs(`${album}`)
      //playMusic(songs[0], true);
      console.log(songs)
      //console.log(pName);
    })

  })
  


}

main();