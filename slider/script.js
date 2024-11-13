// script.js
let currentIndex = 0;
let slidesPerView = 1;

// Define slides directly
let slides = [
    { title: "Slide 1", url: "https://example.com", logo: "https://th.bing.com/th/id/R.ebe12dc32db7d3a0089ce0f1c5b0caea?rik=gatB2Ut7aWOLtg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-EzeswpQ0o7M%2fURusTcu183I%2fAAAAAAAAACQ%2fU6b9mbyvO-4%2fs1600%2ffacebook%2blogo%2b7.jpg&ehk=d8y3tYTW51sJk69QOxaCsmrcJdamfbydV0WUyIMk7EM%3d&risl=&pid=ImgRaw&r=0" },
    { title: "Slide 2", url: "https://example.com", logo: "https://th.bing.com/th/id/R.ebe12dc32db7d3a0089ce0f1c5b0caea?rik=gatB2Ut7aWOLtg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-EzeswpQ0o7M%2fURusTcu183I%2fAAAAAAAAACQ%2fU6b9mbyvO-4%2fs1600%2ffacebook%2blogo%2b7.jpg&ehk=d8y3tYTW51sJk69QOxaCsmrcJdamfbydV0WUyIMk7EM%3d&risl=&pid=ImgRaw&r=0" },
    { title: "Slide 3", url: "https://example.com", logo: "https://th.bing.com/th/id/R.ebe12dc32db7d3a0089ce0f1c5b0caea?rik=gatB2Ut7aWOLtg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-EzeswpQ0o7M%2fURusTcu183I%2fAAAAAAAAACQ%2fU6b9mbyvO-4%2fs1600%2ffacebook%2blogo%2b7.jpg&ehk=d8y3tYTW51sJk69QOxaCsmrcJdamfbydV0WUyIMk7EM%3d&risl=&pid=ImgRaw&r=0" },
    { title: "Slide 4", url: "https://example.com", logo: "https://th.bing.com/th/id/R.ebe12dc32db7d3a0089ce0f1c5b0caea?rik=gatB2Ut7aWOLtg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-EzeswpQ0o7M%2fURusTcu183I%2fAAAAAAAAACQ%2fU6b9mbyvO-4%2fs1600%2ffacebook%2blogo%2b7.jpg&ehk=d8y3tYTW51sJk69QOxaCsmrcJdamfbydV0WUyIMk7EM%3d&risl=&pid=ImgRaw&r=0" },
];

// Function to display slides
function displaySlides() {
    const slider = document.getElementById("slider");
    slider.innerHTML = ''; // Clear current slides

    slides.forEach((slide) => {
        const slideDiv = document.createElement("div");
        slideDiv.classList.add("slide");

        slideDiv.innerHTML = `
            <div class="slide-content">
                <a href="${slide.url}" target="_blank">
                    <img src="${slide.logo}" alt="${slide.title}">
                </a>
            </div>
            <div class="slide-title">${slide.title}</div>
        `;

        slider.appendChild(slideDiv);
    });

    updateSlidePosition();
}

// Function to update slide position
function updateSlidePosition() {
    const slider = document.getElementById("slider");
    const slideWidth = 100 / slidesPerView;
    slider.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
}

// Adjusts slidesPerView based on screen width
function adjustSlidesPerView() {
    slidesPerView = window.innerWidth > 600 ? 3 : 1;
    currentIndex = 0; // Reset to the first slide
    updateSlidePosition();
}

// Navigation functions
function nextSlide() {
    if (currentIndex < slides.length - slidesPerView) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    updateSlidePosition();
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = slides.length - slidesPerView;
    }
    updateSlidePosition();
}

// Initialize the slider display
displaySlides();

// Listen for window resize
window.addEventListener("resize", adjustSlidesPerView);
adjustSlidesPerView();