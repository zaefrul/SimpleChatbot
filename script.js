document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatBot = document.getElementById("chatBot");
    const chatbox = document.getElementById("chatbox");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");
    const rasaURL = "http://127.0.0.1:5005/webhooks/rest/webhook";

    // Toggle chatbot visibility
    chatbotToggle.addEventListener("click", toggleChatBot);
    function toggleChatBot() {
        chatBot.style.display = chatBot.style.display === "none" ? "flex" : "none";
        userInput.disabled = !userInput.disabled;
        sendButton.disabled = !sendButton.disabled;
    }

    // Function to add messages to chat
    function addChatMessage(message, className) {
        const messageElement = document.createElement("li");
        messageElement.className = `chat ${className}`;
        messageElement.innerText = message;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement("li");
        typingIndicator.className = "chat typing-indicator";
        typingIndicator.innerHTML = `<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
        chatbox.appendChild(typingIndicator);
        chatbox.scrollTop = chatbox.scrollHeight;
        return typingIndicator;
    }

    // Function to hide typing indicator
    function hideTypingIndicator(typingIndicator) {
        if (typingIndicator) {
            chatbox.removeChild(typingIndicator);
        }
    }

    // Send message to Rasa
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Display user's message
        addChatMessage(message, "chat-outgoing");
        userInput.value = "";

        // Show typing indicator while waiting for response
        const typingIndicator = showTypingIndicator();

        // Send message to Rasa API
        try {
            const response = await fetch(rasaURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: "user", message })
            });
            const data = await response.json();

            // Hide typing indicator
            hideTypingIndicator(typingIndicator);

            // Display Rasa's response
            if (data.length > 0) {
                data.forEach((msg) => addChatMessage(msg.text, "chat-incoming"));
            } else {
                addChatMessage("I'm not sure how to respond to that.", "chat-incoming");
            }
        } catch (error) {
            hideTypingIndicator(typingIndicator);
            addChatMessage("Error: Unable to connect to the chatbot server.", "chat-incoming");
            console.error("Error connecting to Rasa:", error);
        }
    }

    // Send message on button click or Enter key
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
