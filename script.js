let faqData = {}; // Store the FAQ data
let currentLanguage = ''; // Track the selected language

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

// Toggle chatbot visibility
function toggleChatBot() {
    chatBot.style.display = chatBot.style.display === 'none' ? 'flex' : 'none';
}

// Ensure data is loaded before the chatbot is used
async function fetchFAQData(language) {
    try {
        const languageCode = languageMap[language.toLowerCase()];
        const response = await fetch(`source_${languageCode}.json`);
        faqData = await response.json();
        loadCategories();
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        addChatMessage('Sorry, there was an issue loading the FAQ data.');
    }
}

// Helper to display a chat message and return the message element
function addChatMessage(content, className = 'chat-incoming', withPills = null) {
    const message = document.createElement('li');
    message.className = `${className} chat`;
    message.innerHTML = `<p>${content}</p>`;

    // If pills are part of the message, add them inside the same bubble
    if (withPills) {
        const pillsContainer = createPillsContainer(withPills);
        message.appendChild(pillsContainer);
    }

    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;
    return message;
}

// Create a pills container with buttons
function createPillsContainer(options) {
    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'chat-pills';

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.question || option;
        button.onclick = () => {
            // Add the user's selection as an outgoing message
            addChatMessage(option.question || option, 'chat-outgoing');
            handleUserSelection(option); // Handle the selected option
        };
        pillsContainer.appendChild(button);
    });

    return pillsContainer;
}

// Handle the user's selected option (category or question)
function handleUserSelection(option) {
    console.log("User selected:", option); // Log the user's selection

    // Ensure option is either a string or extract it if it's an object
    const selectedOption = typeof option === 'string' ? option : option.question;
    console.log("Processed option:", selectedOption); // Debug log

    // Try to find the selected category
    const category = faqData.faq.find(cat =>
        cat.category.toLowerCase() === selectedOption.toLowerCase()
    );

    if (category) {
        console.log("Category found:", category); // Debug log
        lastSelectedCategory = category; // Store the selected category
        loadQuestions(category); // Load the questions for the selected category
    } else if (lastSelectedCategory && lastSelectedCategory.questions) {
        // Check if the selected option matches a question in the last category
        const question = lastSelectedCategory.questions.find(q =>
            q.question.toLowerCase() === selectedOption.toLowerCase()
        );

        if (question) {
            console.log("Question found:", question); // Debug log
            showAnswer(question, lastSelectedCategory); // Show the answer
        } else {
            console.warn("No matching question found."); // Debug log
            delayedResponse("Sorry, I couldn't find that question. Please try again.");
        }
    } else {
        console.error("No valid category or question context available."); // Debug log
        delayedResponse("Please select a category first.");
    }
}

// Show typing indicator with bouncing dots
function showTypingIndicator() {
    const typingIndicator = document.createElement('li');
    typingIndicator.className = 'chat-incoming typing-indicator';

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots';

    // Create 3 bouncing dots
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
    }

    typingIndicator.appendChild(dotsContainer);
    chatbox.appendChild(typingIndicator);
    chatbox.scrollTop = chatbox.scrollHeight;

    return typingIndicator;
}

// Hide typing indicator
function hideTypingIndicator(indicator) {
    if (indicator) chatbox.removeChild(indicator);
}

// Handle delayed response with optional pills
function delayedResponse(content, pills = null, delay = 1000) {
    const typingIndicator = showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator(typingIndicator);
        addChatMessage(content, 'chat-incoming', pills);
    }, delay);
}

// Delayed response with optional pills
function delayedResponseWithPills(content, pills = null, delay = 1000) {
    const indicator = showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator(indicator);
        addChatMessage(content);
        if (pills) {
            const pillsContainer = createPillsContainer(pills, handleUserSelection);
            chatbox.appendChild(pillsContainer);
        }
    }, delay);
}

// Show greeting when the chatbot launches
function showGreeting() {
    delayedResponse('Hello! Please select your language / Sila pilih bahasa anda:', 0);
    showLanguageSelection();
}

// Show language selection as pills
function showLanguageSelection() {
    createPills(['English', 'Bahasa Malaysia'], selectLanguage);
}

// Enable chat input after language selection
function enableChatInput() {
    userInput.disabled = false;
    sendButton.disabled = false;
}

// Define selectLanguage to load data and update state
function selectLanguage(language) {
    currentLanguage = language;
    addChatMessage(`Language selected: ${language}`, 'chat-outgoing');
    fetchFAQData(language);
    enableChatInput();
}

// Handle user input and respond
sendButton.addEventListener('click', handleUserInput);

// Listen for "Enter" key press to send message
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleUserInput();
    }
});

function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;

    // Add user message aligned to the right
    addChatMessage(input, 'chat-outgoing');
    userInput.value = '';

    processInput(input);
}

let lastSelectedCategory = null; // Store the last selected category

// Process user input to handle categories and context
function processInput(input) {
    const category = faqData.faq.find(cat => cat.category.toLowerCase() === input.toLowerCase());

    if (category) {
        lastSelectedCategory = category; // Store the selected category
        loadQuestions(category);
    } else if (lastSelectedCategory) {
        const relatedQuestions = findRelatedQuestions(input);
        if (relatedQuestions.length > 0) {
            delayedResponse('Did you mean one of these questions?');
            createPills(relatedQuestions, questionText => {
                const question = relatedQuestions.find(q => q.question === questionText);
                showAnswer(question, lastSelectedCategory);
            });
        } else {
            delayedResponse(`I couldn't find a match. Please try asking something else.`);
        }
    } else {
        delayedResponse(`Please select a category first or try asking a relevant question.`);
    }
}

// Improved keyword-based matching for related questions
function findRelatedQuestions(input) {
    const inputKeywords = input.toLowerCase().split(/\s+/); // Split input into keywords
    const relatedQuestions = [];

    faqData.faq.forEach(category => {
        category.questions.forEach(question => {
            const questionText = question.question.toLowerCase();

            // Check if at least one input keyword matches the question text
            const hasMatch = inputKeywords.some(keyword => questionText.includes(keyword));

            if (hasMatch) {
                relatedQuestions.push({ ...question, category });
            }
        });
    });

    return relatedQuestions;
}

// Create pills for options (Bot's response)
function createPills(options, callback) {
    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'chat-pills';

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.question || option;
        button.onclick = () => {
            // Add the user's selection as an outgoing message
            addChatMessage(option.question || option, 'chat-outgoing');
            callback(option.question || option);
        };
        pillsContainer.appendChild(button);
    });

    chatbox.appendChild(pillsContainer);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Example usage of delayedResponse with pills
function loadCategories() {
    const categories = faqData.faq.map(cat => cat.category);
    delayedResponse('Here are the categories:', categories.map(cat => ({ question: cat })));
}

// Load questions for a selected category
function loadQuestions(category) {
    const questions = category.questions.map(q => q.question);
    delayedResponse(`Selected Category: ${category.category}`, questions.map(q => ({ question: q })));
}

// Show the answer to a question with a back option
function showAnswer(question, category) {
    delayedResponse(question.answer, [{ question: 'Back to Questions' }], 500);
    lastSelectedCategory = category;
}

// Initialize chatbot on page load
window.onload = showGreeting;

// Event listener to toggle chatbot visibility
toggleButton.addEventListener('click', toggleChatBot);
