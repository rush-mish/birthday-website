document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('message-modal');
    const audio = document.querySelector('.birthday-song');
    const songSelect = document.getElementById('song-select');
    const modalText = document.getElementById('modal-text');
    const closeBtn = document.querySelector('.close-btn');

    let wasAudioPlaying = false; 
    let musicStarted = false;
    let isUserPaused = false;
    songSelect.addEventListener('change', () => {
        const newSrc = songSelect.value;
        const wasPlaying = !audio.paused;
        // 1. Update the source URL
        audio.querySelector('source').src = newSrc;
        
        // 2. Reload the audio player
        audio.load();

        // 3. Attempt to resume playing, respecting the user's manual pause choice
        if (wasPlaying && !isUserPaused) {
            audio.play().catch(e => console.error("Could not play new song source:", e));
        }
        
        // Ensure the manual pause flag is reset if the user is actively selecting music
        isUserPaused = false; 
    });
    // Listen for the user clicking the pause control on the audio player
    audio.addEventListener('pause', () => {
        // If the audio pauses AND it wasn't paused by the video modal code (i.e., wasAudioPlaying is false), 
        // assume the user did it. This handles the scenario where the audio starts and the user immediately clicks pause.
        if (!wasAudioPlaying) {
             isUserPaused = true;
        }
    });

    // Reset the user pause flag if the user manually clicks play
    audio.addEventListener('play', () => {
        isUserPaused = false;
        musicStarted = true; // Ensure musicStarted is true if they click play
    });
    // Select ALL clickable items: all paragraphs AND the video card div
    const clickableItems = document.querySelectorAll('.message-container p, .message-container .video-card');

    const resumeAudio = () => {
        // Stop the video if it's playing in the modal
        const video = modalText.querySelector('video');
        if (video) video.pause();

        wasAudioPlaying = false; // Reset the flag
        // Resume the background audio ONLY if it was playing before the modal opened
        if (audio && audio.paused && !isUserPaused) {
             audio.play().catch(e => console.error("Could not resume background music: ", e));
        }
    };

    clickableItems.forEach(item => {
        item.addEventListener('click', () => {
            const messageContent = item.getAttribute('data-full-message');
            const videoSource = item.getAttribute('data-video-src');
            const imageSource = item.getAttribute('data-image-src');
            
            // Clear previous modal content
            modalText.innerHTML = ''; 

            if (videoSource) {
                // CASE 1: Video Card
                if (audio && !audio.paused) {
                    wasAudioPlaying = true; 
                    audio.pause(); 
                } else {
                    wasAudioPlaying = false; 
                }
                
                // Create and insert video player elements
                const videoElement = document.createElement('video');
                videoElement.setAttribute('controls', true);
                videoElement.setAttribute('autoplay', true);

                const sourceElement = document.createElement('source');
                sourceElement.setAttribute('src', videoSource);
                sourceElement.setAttribute('type', 'video/mp4'); 

                videoElement.appendChild(sourceElement);
                videoElement.style.maxWidth = '100%';
                videoElement.style.borderRadius = '10px';
                
                modalText.appendChild(videoElement);
                modal.style.display = 'block';
                
                videoElement.play().catch(error => {
                    console.log('Autoplay blocked.');
                });
                
            } else if (imageSource) {
                // CASE 2: Image Message (Music continues, no pause needed)

                const imageElement = document.createElement('img');
                imageElement.setAttribute('src', imageSource);
                imageElement.setAttribute('alt', 'A special memory'); 
                
                // Add styling to make the image fit the modal nicely
                imageElement.style.maxWidth = '100%';
                imageElement.style.maxHeight = '70vh';
                imageElement.style.borderRadius = '10px';
                imageElement.style.display = 'block';
                imageElement.style.margin = '0 auto 15px auto';
                
                modalText.appendChild(imageElement);
                
                if (messageContent) {
                    const textP = document.createElement('p');
                    textP.innerHTML = messageContent; 
                    modalText.appendChild(textP);
                }
                modal.style.display = 'block';

            } else if (messageContent) {
                // CASE 3: Standard Text Message (Music continues)
                modalText.innerHTML = messageContent;
                modal.style.display = 'block';
            }
        });
    });

    // 4. Close the modal when the 'X' is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resumeAudio();
    });
    // 5. Close the modal when the user clicks anywhere outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            // Stop the video when the modal closes
            resumeAudio();
        }
    });

    // Optional: Close modal when 'Escape' key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            resumeAudio();
        }
    });

    const startMusic = () => {
        if (!musicStarted) {
            audio.play()
                .then(() => {
                    musicStarted = true;
                })
                .catch(error => {
                    // Autoplay blocked.
                });
        }
    };
    startMusic(); 

    document.addEventListener('click', function initiateMusic() {
        if (!musicStarted && audio.paused) {
            audio.play()
                .then(() => {
                    musicStarted = true;
                    document.removeEventListener('click', initiateMusic); 
                })
                .catch(e => {});
        }
    });
});