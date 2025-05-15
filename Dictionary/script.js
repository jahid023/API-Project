document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const wordElement = document.getElementById('word');
    const phoneticElement = document.getElementById('phonetic');
    const audioBtn = document.getElementById('audioBtn');
    const meaningsContainer = document.getElementById('meanings');
    
    let audio = null;

    // Search when button is clicked
    searchBtn.addEventListener('click', searchWord);
    
    // Also search when Enter key is pressed
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });

    // Play audio when audio button is clicked
    audioBtn.addEventListener('click', () => {
        if (audio) {
            audio.play();
        }
    });

    // Function to search for a word
    async function searchWord() {
        const word = searchInput.value.trim();
        
        if (!word) {
            showError('Please enter a word to search');
            return;
        }

        // Show loading, hide results and error
        loadingDiv.style.display = 'flex';
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            
            if (!response.ok) {
                throw new Error('Word not found');
            }
            
            const data = await response.json();
            displayResults(data[0]);
            
        } catch (error) {
            showError('Sorry, we couldn\'t find the word you were looking for.');
            console.error('Error fetching data:', error);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // Function to display the results
    function displayResults(data) {
        // Clear previous results
        meaningsContainer.innerHTML = '';
        
        // Set word and phonetic
        wordElement.textContent = data.word;
        
        // Find the first available phonetic with audio
        const phoneticWithAudio = data.phonetics?.find(p => p.audio && p.audio.trim() !== '');
        const phoneticText = data.phonetic || data.phonetics?.[0]?.text || '';
        
        phoneticElement.textContent = phoneticText;
        
        // Set up audio if available
        if (phoneticWithAudio?.audio) {
            // Create new audio object
            audio = new Audio(phoneticWithAudio.audio);
            audioBtn.style.display = 'flex';
        } else {
            audioBtn.style.display = 'none';
        }
        
        // Process and display meanings
        if (data.meanings && data.meanings.length > 0) {
            data.meanings.forEach(meaning => {
                const meaningElement = document.createElement('div');
                meaningElement.className = 'meaning';
                
                // Part of speech (noun, verb, etc.)
                const partOfSpeech = document.createElement('h3');
                partOfSpeech.className = 'part-of-speech';
                partOfSpeech.textContent = meaning.partOfSpeech;
                meaningElement.appendChild(partOfSpeech);
                
                // Definitions
                if (meaning.definitions && meaning.definitions.length > 0) {
                    meaning.definitions.forEach((def, index) => {
                        // Only show the first 3 definitions to keep it concise
                        if (index < 3) {
                            // Definition
                            const definition = document.createElement('p');
                            definition.className = 'definition';
                            definition.textContent = def.definition;
                            meaningElement.appendChild(definition);
                            
                            // Example if available
                            if (def.example) {
                                const example = document.createElement('p');
                                example.className = 'example';
                                example.textContent = `"${def.example}"`;
                                meaningElement.appendChild(example);
                            }
                            
                            // Add a small divider between definitions (except after the last one)
                            if (index < Math.min(2, meaning.definitions.length - 1)) {
                                const divider = document.createElement('hr');
                                divider.className = 'divider';
                                meaningElement.appendChild(divider);
                            }
                        }
                    });
                }
                
                // Synonyms if available
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    const synonymsContainer = document.createElement('div');
                    synonymsContainer.className = 'synonyms';
                    
                    const synonymLabel = document.createElement('span');
                    synonymLabel.textContent = 'Synonyms: ';
                    synonymLabel.style.fontWeight = '500';
                    synonymsContainer.appendChild(synonymLabel);
                    
                    // Only show first 3 synonyms to keep it clean
                    meaning.synonyms.slice(0, 3).forEach(synonym => {
                        const synonymSpan = document.createElement('span');
                        synonymSpan.className = 'synonym-tag';
                        synonymSpan.textContent = synonym;
                        synonymSpan.addEventListener('click', () => {
                            searchInput.value = synonym;
                            searchWord();
                        });
                        synonymsContainer.appendChild(synonymSpan);
                    });
                    
                    meaningElement.appendChild(synonymsContainer);
                }
                
                meaningsContainer.appendChild(meaningElement);
            });
        }
        
        // Show results
        resultsDiv.classList.remove('hidden');
    }
    
    // Function to show error message
    function showError(message) {
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        `;
        errorDiv.classList.remove('hidden');
    }
    
    // Focus the search input on page load
    searchInput.focus();
});
