let faqData = {}; // Store the FAQ data
let currentLanguage = ''; // Track the selected language
let isLanguageSelected = false; // Track if language is selected

// Translation object for multilingual support
const translations = {
    en: {
        greeting: "Hello and welcome! I’m LYNA, your friendly assistant here to help you with any questions or information you need.",
        greeting_continue: "😊 To get started, please select your preferred language:",
        selectLanguage: "Please select a language first.",
        loadError: "Unable to load FAQ data. Please try again.",
        noMatch: `
                    <p>I'm really sorry, I couldn't find a match for that. Please try rephrasing or select a category.</p>
                    <p>If you need further assistance, feel free to reach out to our support team:</p>
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li style="margin-bottom: 5px;"><strong>📞 Phone:</strong> <a href="tel:0380008000">03-8000 8000</a></li>
                        <li style="margin-bottom: 5px;"><strong>📞 Toll-Free:</strong> <a href="tel:1800887723">1800 88 7723</a></li>
                        <li style="margin-bottom: 5px;"><strong>✉️ Email:</strong> <a href="mailto:aduan@mot.gov.my">aduan@mot.gov.my</a></li>
                    </ul>
                    <p>We’re here to help!</p>
                `,
        askCategory: "It seems like you’re asking about one of these categories:",
        categoriesHeader: "Great! Here’s what I can help you with. Choose a category to get started:",
        questionsHeader: "Wonderful choice! Here are some common questions. Please select one to learn more:",
        referringTo: "It looks like you're referring to:",
        backToQuestions: "Back to Questions",
        backToCategory: "Back to Category", // Added this
        directoryDate: "It looks like you're asking about dates:",
    },
    my: {
        greeting: "Hai dan selamat datang! Saya LYNA, pembantu mesra anda yang sedia membantu dengan apa sahaja soalan atau maklumat yang anda perlukan.",
        greeting_continue: "😊 Untuk mula, sila pilih bahasa pilihan anda:",
        selectLanguage: "Sila pilih bahasa terlebih dahulu.",
        loadError: "Tidak dapat memuatkan data FAQ. Sila cuba lagi.",
        noMatch: `
                    <p>Maaf sangat, saya tak dapat mencari padanan untuk itu. Sila cuba lagi atau pilih kategori.</p>
                    <p>Jika anda perlukan bantuan lanjut, hubungi pasukan sokongan kami:</p>
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li style="margin-bottom: 5px;"><strong>📞 Telefon:</strong> <a href="tel:0380008000">03-8000 8000</a></li>
                        <li style="margin-bottom: 5px;"><strong>📞 Talian Bebas:</strong> <a href="tel:1800887723">1800 88 7723</a></li>
                        <li style="margin-bottom: 5px;"><strong>✉️ Emel:</strong> <a href="mailto:aduan@mot.gov.my">aduan@mot.gov.my</a></li>
                    </ul>
                    <p>Kami sedia membantu anda!</p>
                `,
        askCategory: "Anda mungkin bertanya mengenai salah satu kategori ini:",
        categoriesHeader: "Bagus! Berikut adalah pilihan yang saya boleh bantu. Pilih kategori untuk bermula:",
        questionsHeader: "Pilihan yang bagus! Berikut adalah soalan-soalan biasa. Sila pilih satu untuk maklumat lanjut:",
        referringTo: "Nampaknya anda merujuk kepada:",
        backToQuestions: "Kembali ke Soalan",
        backToCategory: "Kembali ke Kategori", // Added this
        directoryDate: "Nampaknya anda bertanya mengenai tarikh:",
    }
};

// Select chat elements
const chatbox = document.getElementById('chatbox');
const chatBot = document.getElementById('chatBot');
const toggleButton = document.getElementById('chatbot-toggle');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');

// Language map for filenames
const languageMap = {
    'english': 'en',
    'bahasa malaysia': 'my'
};

// Register the Compromise dates plugin for NLP
nlp.extend(window.compromiseDates);

let lastSelectedCategory = null; // Store the last selected category

// Toggle chatbot visibility
function toggleChatBot() {
    // clear chatbox when chatbot is hidden
    if (chatBot.style.display === 'none') {
        chatbox.innerHTML = '';
        lastSelectedCategory = null; // Reset selected category
    }
    chatBot.style.display = chatBot.style.display === 'none' ? 'flex' : 'none';
    if (chatBot.style.display === 'flex') userInput.focus(); showGreeting();
}

// Fetch FAQ data based on language selection
async function fetchFAQData(language) {
    try {
        const languageCode = languageMap[language.toLowerCase()];
        console.log(`Fetching data for language: ${language} (${languageCode})`);

        const response = await fetch(`source_${languageCode}.json`);
        if (!response.ok) throw new Error(translations[languageCode].loadError);

        faqData = await response.json();
        console.log('Data fetched successfully:', faqData);
        
        isLanguageSelected = true; // Set flag only after data is successfully loaded
        loadCategories();
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        delayedResponse(translations[languageCode].loadError);
    }
}

function processInput(input) {
    if (!isLanguageSelected) {
        delayedResponse(translations[currentLanguage].selectLanguage);
        return;
    }

    const nlpResponse = analyzeUserInput(input); // NLP detection

    if (nlpResponse) {
        delayedResponse(nlpResponse); // Handle NLP-detected response
    } else {
        // Check if input is the "Back to Questions" action
        if (input.toLowerCase() === translations[currentLanguage].backToQuestions.toLowerCase() && lastSelectedCategory) {
            loadQuestions(lastSelectedCategory); // Reload questions for the last selected category
            return;
        }

        // Check if input is the "Back to Category" action
        if (input.toLowerCase() === translations[currentLanguage].backToCategory.toLowerCase()) {
            loadCategories(); // Reload the categories list
            lastSelectedCategory = null; // Reset selected category
            return;
        }

        // Check if input matches a category first
        const matchingCategory = findCategoryByName(input);
        if (matchingCategory) {
            loadQuestions(matchingCategory); // Load questions if a category is recognized
            lastSelectedCategory = matchingCategory; // Store selected category for future use
            return;
        }

        // Check if input matches a question in the last selected category
        if (lastSelectedCategory) {
            const matchingQuestion = findQuestionByName(lastSelectedCategory, input);
            if (matchingQuestion) {
                showAnswer(matchingQuestion); // Display the answer if a question is found
                return;
            }
        }

        // Fallback if no match for question or category
        const matchingCategories = findMatchingCategories(input);
        if (matchingCategories.length > 0) {
            delayedResponse(translations[currentLanguage].askCategory, matchingCategories);
        } else {
            delayedResponse(translations[currentLanguage].noMatch);
            loadCategories(); // Fallback to showing all categories
        }
    }
}

// Helper function to find a category based on input, supporting both languages
function findCategoryByName(input) {
    return faqData.faq.find(cat =>
        cat.category.toLowerCase() === input.toLowerCase()
    );
}

// Helper function to find a question by name in the specified category
function findQuestionByName(category, questionText) {
    return category.questions.find(q =>
        q.question.toLowerCase() === questionText.toLowerCase()
    );
}


// Analyze user input using Compromise.js (only for NLP purposes)
const DIRECTORY_URL = "https://yourwebsite.com/directory";

function analyzeUserInput(input) {
    const doc = nlp(input); // Parse input with Compromise.js

    // Detect dates
    const dates = doc.dates().out('array');
    if (dates.length > 0) {
        return `${translations[currentLanguage].directoryDate} ${dates.join(', ')}`;
    }

    // Detect people names and create pills for navigation to directory
    const people = doc.people().out('array');
    if (people.length > 0) {
        const namePills = people.map(name => ({
            question: name,
            url: `${DIRECTORY_URL}?search=${encodeURIComponent(name)}`
        }));
        delayedResponse(translations[currentLanguage].referringTo, namePills);
        return null; // Pills are created, so no further response is needed here
    }

    return null; // Return null if no specific entities are found
}

// Find a question across all categories based on input
function findQuestionInAllCategories(input) {
    for (let category of faqData.faq) {
        const question = category.questions.find(q =>
            q.question.toLowerCase().includes(input.toLowerCase())
        );
        if (question) return { question, category };
    }
    return null; // No match found
}

// Find matching categories based on input without causing a loop
function findMatchingCategories(input) {
    return faqData.faq
        .filter(cat => cat.category.toLowerCase().includes(input.toLowerCase()))
        .map(cat => ({ question: cat.category }));
}

// Handle language selection (disables NLP until language is selected)
function handleLanguageSelection(language) {
    currentLanguage = languageMap[language.toLowerCase()]; // Set current language code
    addChatMessage(language, 'chat-outgoing');
    fetchFAQData(language);
    enableChatInput();
}

// Enable chat input after language selection
function enableChatInput() {
    userInput.disabled = false;
    sendButton.disabled = false;
}

// Handle user selection (for categories or questions)
function handleUserSelection(option) {
    const selectedOption = option.question || option;
    
    // Check if selection is for language, and handle appropriately
    if (selectedOption.toLowerCase() in languageMap) {
        handleLanguageSelection(selectedOption);
    } else {
        addChatMessage(selectedOption, 'chat-outgoing');
        processInput(selectedOption);
    }
}

// Add chat message dynamically
function addChatMessage(content, className = 'chat-incoming', pills = null) {
    const message = document.createElement('li');
    message.className = `${className} chat`;
    message.innerHTML = `<p>${content}</p>`;
    if (pills) message.appendChild(createPillsContainer(pills));
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Create pills dynamically
function createPillsContainer(options) {
    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'chat-pills';

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.question || option;

        // Check for custom URL and set click handler to redirect
        if (option.url) {
            button.onclick = () => window.open(option.url, '_blank');
        } else {
            button.onclick = () => handleUserSelection(option);
        }

        pillsContainer.appendChild(button);
    });

    return pillsContainer;
}

// Show list of categories
function loadCategories() {
    const categories = faqData.faq.map(cat => ({ question: cat.category }));
    delayedResponse(translations[currentLanguage].categoriesHeader, categories);
}

// Load questions for the matched category with "Back to Category" option
function loadQuestions(category) {
    const questions = category.questions.map(q => ({ question: q.question }));
    const backToCategoryPill = { question: translations[currentLanguage].backToCategory };
    delayedResponse(`${translations[currentLanguage].questionsHeader } ${category.category}`, [...questions, backToCategoryPill]);
}

// Show the answer to a matched question
function showAnswer(question) {
    delayedResponse(question.answer, [{ question: translations[currentLanguage].backToQuestions }], 500);
    // Do not reset lastSelectedCategory here to allow "Back to Questions" functionality
}

// Delayed response with typing indicator
function delayedResponse(content, pills = null, delay = 1000) {
    const typingIndicator = showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator(typingIndicator);
        addChatMessage(content, 'chat-incoming', pills);
    }, delay);
}

// Display typing indicator
function showTypingIndicator() {
    const typing = document.createElement('li');
    typing.className = 'chat-incoming typing-indicator';
    typing.innerHTML = `
        <div class="dots">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>`;
    chatbox.appendChild(typing);
    chatbox.scrollTop = chatbox.scrollHeight;
    return typing;
}

// Hide typing indicator
function hideTypingIndicator(indicator) {
    if (indicator) chatbox.removeChild(indicator);
}

// Show greeting message with language selection pills
function showGreeting() {
    const languages = [
        { question: 'English', language: 'English' },
        { question: 'Bahasa Malaysia', language: 'Bahasa Malaysia' }
    ];
    delayedResponse(`${translations['my'].greeting} / ${translations['en'].greeting}`); // Initial greeting in English
    delayedResponse(`${translations['my'].greeting_continue} / ${translations['en'].greeting_continue}`, languages, 1500);
}

// Initialize chatbot on page load
// window.onload = showGreeting;

// Event listeners for chatbot interaction
toggleButton.addEventListener('click', toggleChatBot);
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') handleUserInput();
});

// Handle user input from the text field
function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;
    addChatMessage(input, 'chat-outgoing');
    userInput.value = '';
    processInput(input);
}
