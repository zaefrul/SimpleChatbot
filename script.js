let faqData = {}; // Store the FAQ data
let currentLanguage = ''; // Track the current language

// Select chat elements
const chatbox = document.getElementById('chatbox');
const chatBot = document.getElementById('chatBot');
const toggleButton = document.getElementById('chatbot-toggle');

// Toggle chatbot visibility
function toggleChatBot() {
    chatBot.style.display = chatBot.style.display === 'none' ? 'flex' : 'none';
}

// Fetch the FAQ data based on the selected language
async function fetchFAQData(language) {
    try {
        const response = await fetch(`source_${language}.json`);
        faqData = await response.json();
        loadCategories(); // Load categories after data is fetched
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        addChatMessage('Sorry, there was an issue loading the FAQ data.');
    }
}

// Helper to display a chat message
function addChatMessage(content, className = 'chat-incoming') {
    const message = document.createElement('li');
    message.className = `${className} chat`;
    message.innerHTML = `<p>${content}</p>`;
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the latest message
}

// Show language selection as part of the chat
function showLanguageSelection() {
    addChatMessage('Welcome! Please select your language / Sila pilih bahasa anda:', 'chat-incoming');
    addButtonsToChat(['English', 'Bahasa Malaysia'], (label) => {
        const language = label === 'English' ? 'en' : 'my';
        selectLanguage(language);
    });
}

// Handle language selection and load the relevant data
function selectLanguage(language) {
    currentLanguage = language;
    addChatMessage(`Language selected: ${language === 'en' ? 'English' : 'Bahasa Malaysia'}`, 'chat-outgoing');
    fetchFAQData(language); // Fetch the data in the selected language
}

// Load FAQ categories as buttons in the chat
function loadCategories() {
    addChatMessage('Here are the categories:', 'chat-incoming');
    const categories = faqData.faq.map((cat) => cat.category);
    addButtonsToChat(categories, (selectedCategory) => {
        const category = faqData.faq.find((cat) => cat.category === selectedCategory);
        loadQuestions(category);
    });
}

// Load questions for a selected category
function loadQuestions(category) {
    addChatMessage(`Selected Category: ${category.category}`, 'chat-outgoing');
    const questions = category.questions.map((q) => q.question);
    addButtonsToChat(questions, (selectedQuestion) => {
        const question = category.questions.find((q) => q.question === selectedQuestion);
        showAnswer(question, category);
    });
}

// Show the answer to a selected question
function showAnswer(question, category) {
    addChatMessage(`Question: ${question.question}`, 'chat-outgoing');
    addChatMessage(question.answer, 'chat-incoming');
    addButtonsToChat(['Back to Questions'], () => loadQuestions(category));
}

// Helper to add buttons as part of the chat
function addButtonsToChat(options, callback) {
    const message = document.createElement('li');
    message.className = 'chat-incoming chat';
    options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'chat-button';
        button.onclick = () => callback(option);
        message.appendChild(button);
    });
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the latest message
}

// Initialize chatbot on page load
window.onload = showLanguageSelection;

// Event listener to toggle chatbot visibility
toggleButton.addEventListener('click', toggleChatBot);
