document.addEventListener("DOMContentLoaded", function () {
  let faqData = {}; // Store the FAQ data
  let currentLanguage = ""; // Track the selected language
  let isLanguageSelected = false; // Track if language is selected

  // Translation object for multilingual support
  const translations = {
    en: {
      greeting:
        "Hello and welcome! I’m LYNA, your friendly assistant here to help you with any questions or information you need.",
      greeting_continue:
        "😊 To get started, please select your preferred language:",
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
      categoriesHeader:
        "Great! Here’s what I can help you with. Choose a category to get started:",
      questionsHeader:
        "Wonderful choice! Here are some common questions. Please select one to learn more:",
      referringTo: "It looks like you're referring to:",
      backToQuestions: "Back to Questions",
      backToCategory: "Back to Category", // Added this
      directoryDate: "It looks like you're asking about dates:",
    },
    my: {
      greeting:
        "Hai dan selamat datang! Saya LYNA, pembantu mesra anda yang sedia membantu dengan apa sahaja soalan atau maklumat yang anda perlukan.",
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
      categoriesHeader:
        "Bagus! Berikut adalah pilihan yang saya boleh bantu. Pilih kategori untuk bermula:",
      questionsHeader:
        "Pilihan yang bagus! Berikut adalah soalan-soalan biasa. Sila pilih satu untuk maklumat lanjut:",
      referringTo: "Nampaknya anda merujuk kepada:",
      backToQuestions: "Kembali ke Soalan",
      backToCategory: "Kembali ke Kategori", // Added this
      directoryDate: "Nampaknya anda bertanya mengenai tarikh:",
    },
  };

  // Select chat elements
  const chatbox = document.getElementById("chatbox");
  const chatBot = document.getElementById("chatBot");
  const toggleButton = document.getElementById("chatbot-toggle");
  const closeChatBot = document.getElementById("close-chatbot");
  const userInput = document.getElementById("user-input");
  const sendLink = document.getElementById("send-link");

  // Language map for filenames
  const languageMap = {
    english: "en",
    "bahasa malaysia": "my",
  };

  // Register the Compromise dates plugin for NLP
  nlp.extend(window.compromiseDates);

  let lastSelectedCategory = null; // Store the last selected category

  // Toggle chatbot visibility
  function toggleChatBot() {
    if (chatBot.classList.contains("hidden")) {
        chatbox.innerHTML = "";
        lastSelectedCategory = null; // Reset selected category
    }
    chatBot.classList.toggle("hidden");
    if (!chatBot.classList.contains("hidden")) {
        userInput.focus();
        showGreeting();
    }
}

  // Fetch FAQ data based on language selection
  async function fetchFAQData(language) {
    try {
      const languageCode = languageMap[language.toLowerCase()];
      console.log(`Fetching data for language: ${language} (${languageCode})`);

      faqData = languageCode === "en" ? source_en : source_my;
      console.log("Data fetched successfully:", faqData);

      isLanguageSelected = true; // Set flag only after data is successfully loaded
      loadCategories();
    } catch (error) {
      console.error("Error loading FAQ data:", error);
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
      if (
        input.toLowerCase() ===
          translations[currentLanguage].backToQuestions.toLowerCase() &&
        lastSelectedCategory
      ) {
        loadQuestions(lastSelectedCategory); // Reload questions for the last selected category
        return;
      }

      if (
        input.toLowerCase() ===
        translations[currentLanguage].backToCategory.toLowerCase()
      ) {
        loadCategories(); // Reload the categories list
        lastSelectedCategory = null; // Reset selected category
        return;
      }

      const matchingCategory = findCategoryByName(input);
      if (matchingCategory) {
        loadQuestions(matchingCategory); // Load questions if a category is recognized
        lastSelectedCategory = matchingCategory; // Store selected category for future use
        return;
      }

      if (lastSelectedCategory) {
        const matchingQuestion = findQuestionByName(
          lastSelectedCategory,
          input
        );
        if (matchingQuestion) {
          showAnswer(matchingQuestion); // Display the answer if a question is found
          return;
        }
      }

      const matchingCategories = findMatchingCategories(input);
      if (matchingCategories.length > 0) {
        delayedResponse(
          translations[currentLanguage].askCategory,
          matchingCategories
        );
      } else {
        delayedResponse(translations[currentLanguage].noMatch);
      }
    }
  }

  function findCategoryByName(input) {
    return faqData.faq.find(
      (cat) => cat.category.toLowerCase() === input.toLowerCase()
    );
  }

  function findQuestionByName(category, questionText) {
    return category.questions.find(
      (q) => q.question.toLowerCase() === questionText.toLowerCase()
    );
  }

  const DIRECTORY_URL = "https://yourwebsite.com/directory";

  function analyzeUserInput(input) {
    const doc = nlp(input); // Parse input with Compromise.js

    const dates = doc.dates().out("array");
    if (dates.length > 0) {
      return `${translations[currentLanguage].directoryDate} ${dates.join(", ")}`;
    }

    const people = doc.people().out("array");
    if (people.length > 0) {
      const namePills = people.map((name) => ({
        question: name,
        url: `${DIRECTORY_URL}?search=${encodeURIComponent(name)}`,
      }));
      delayedResponse(translations[currentLanguage].referringTo, namePills);
      return null; // Pills are created, so no further response is needed here
    }

    return null; // Return null if no specific entities are found
  }

  function findQuestionInAllCategories(input) {
    for (let category of faqData.faq) {
      const question = category.questions.find((q) =>
        q.question.toLowerCase().includes(input.toLowerCase())
      );
      if (question) return { question, category };
    }
    return null; // No match found
  }

  function findMatchingCategories(input) {
    return faqData.faq
      .filter((cat) => cat.category.toLowerCase().includes(input.toLowerCase()))
      .map((cat) => ({ question: cat.category }));
  }

  function handleLanguageSelection(language) {
    currentLanguage = languageMap[language.toLowerCase()]; // Set current language code
    addChatMessage(language, "chat-outgoing");
    fetchFAQData(language);
    enableChatInput();
  }

  function enableChatInput() {
    userInput.disabled = false;
    sendLink.classList.remove("disabled");
  }

  function handleUserSelection(option) {
    const selectedOption = option.question || option;

    if (selectedOption.toLowerCase() in languageMap) {
      handleLanguageSelection(selectedOption);
    } else {
      addChatMessage(selectedOption, "chat-outgoing");
      processInput(selectedOption);
    }
  }

  function addChatMessage(content, className = "chat-incoming", pills = null) {
    const message = document.createElement("li");
    message.className = `${className} chat`;
    message.innerHTML = `<p>${content}</p>`;
    if (pills) message.appendChild(createPillsContainer(pills));
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function createPillsContainer(options) {
    const pillsContainer = document.createElement("div");
    pillsContainer.className = "chat-pills";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option.question || option;
      button.type = "button";

      if (option.url) {
        button.onclick = () => window.open(option.url, "_blank");
      } else {
        button.onclick = () => handleUserSelection(option);
      }

      pillsContainer.appendChild(button);
    });

    return pillsContainer;
  }

  function loadCategories() {
    const categories = faqData.faq.map((cat) => ({ question: cat.category }));
    delayedResponse(translations[currentLanguage].categoriesHeader, categories);
  }

  function loadQuestions(category) {
    const questions = category.questions.map((q) => ({ question: q.question }));
    const backToCategoryPill = {
      question: translations[currentLanguage].backToCategory,
    };
    delayedResponse(
      `${translations[currentLanguage].questionsHeader} ${category.category}`,
      [...questions, backToCategoryPill]
    );
  }

  function showAnswer(question) {
    delayedResponse(
      question.answer,
      [{ question: translations[currentLanguage].backToQuestions }],
      500
    );
  }

  function delayedResponse(content, pills = null, delay = 1000) {
    const typingIndicator = showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator(typingIndicator);
      addChatMessage(content, "chat-incoming", pills);
    }, delay);
  }

  function showTypingIndicator() {
    const typing = document.createElement("li");
    typing.className = "chat-incoming typing-indicator";
    typing.innerHTML = `
        <div class="dots">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>`;
    chatbox.appendChild(typing);
    chatbox.scrollTop = chatbox.scrollHeight;
    return typing;
  }

  function hideTypingIndicator(indicator) {
    if (indicator) chatbox.removeChild(indicator);
  }

  function showGreeting() {
    const languages = [
      { question: "English", language: "English" },
      { question: "Bahasa Malaysia", language: "Bahasa Malaysia" },
    ];
    delayedResponse(
      `${translations["my"].greeting} / ${translations["en"].greeting}`
    );
    delayedResponse(
      `${translations["my"].greeting_continue} / ${translations["en"].greeting_continue}`,
      languages,
      1500
    );
  }

  toggleButton.addEventListener("click", toggleChatBot);
  closeChatBot.addEventListener("click", toggleChatBot);
  sendLink.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default link behavior
    handleUserInput();
  });
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") handleUserInput();
  });

  function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;
    addChatMessage(input, "chat-outgoing");
    userInput.value = "";
    processInput(input);
  }


  const source_en = {
    faq: [
      {
        category: "MyJPJ App",
        questions: [
          {
            question: "Is downloading MyJPJ mandatory?",
            answer:
              "No. It is just one of the options for obtaining a digital copy of road tax and driving license.",
          },
          {
            question: "Will I get fined if I can't show the digital road tax?",
            answer:
              "No. Enforcement officers can verify the status via their enforcement devices.",
          },
          {
            question:
              "Do I need to renew road tax and licenses after expiration?",
            answer:
              "Yes, they need to be renewed, but no stickers are required to be pasted.",
          },
          {
            question:
              "What if the elderly or those without smartphones need proof?",
            answer:
              "Don't worry. Digital formats are not mandatory; physical stickers are still available.",
          },
          {
            question:
              "How to show digital road tax if someone else drives the car?",
            answer:
              "The digital road tax can be printed on paper and kept in the car.",
          },
          {
            question: "Why can’t I log in to MyJPJ?",
            answer:
              "High traffic might prevent login as many people try to register simultaneously.",
          },
        ],
      },
      {
        category: "Air Accident Investigation Bureau (AAIB)",
        questions: [
          {
            question: "How to report an aircraft accident or serious incident?",
            answer:
              "Report to the AAIB using the designated form and email it to AAIB@mot.gov.my.",
          },
          {
            question: "Who must report an aircraft accident?",
            answer:
              "Aircraft crew, owners, operators, maintenance staff, air traffic controllers, and Civil Aviation Authority staff.",
          },
          {
            question: "What information is needed when reporting to AAIB?",
            answer:
              "Details like aircraft type, registration, date/time, departure/landing points, injuries, and accident nature.",
          },
          {
            question: "What are the stages of an investigation report?",
            answer:
              "The stages include Notification, Preliminary Report, Draft Final Report, Final Report, and Interim Statement.",
          },
        ],
      },
      {
        category: "Administration and Finance Division",
        questions: [
          {
            question: "What is a movable asset?",
            answer:
              "An asset that can be transferred between locations, even if installed with a building.",
          },
          {
            question: "What are capital assets?",
            answer:
              "Movable assets with an initial value of RM1,000 or more, or those requiring scheduled maintenance.",
          },
          {
            question: "What is the definition of inventory?",
            answer:
              "Movable assets costing less than RM1,000 each, not requiring scheduled maintenance.",
          },
          {
            question: "How to participate in tenders or quotations?",
            answer:
              "Registered companies can apply through the Ministry's system or e-Bidding website.",
          },
          {
            question: "When to apply for an advance?",
            answer:
              "Applications must be sent at least a week before the trip.",
          },
          {
            question: "What is the payment timeline for claims?",
            answer:
              "Claims are processed within 14 days for procurement exceeding RM50,000 and below RM500,000.",
          },
        ],
      },
      {
        category: "Human Resource Management Division",
        questions: [
          {
            question: "How is acting allowance calculated?",
            answer:
              "It’s based on the difference between the acting post's starting salary and the officer's current salary.",
          },
          {
            question: "How is seniority determined?",
            answer:
              "For appointments, based on the permanent appointment date. For promotions, based on the post-filling date.",
          },
          {
            question: "Can duty coverage be instituted on holidays?",
            answer: "No, it must be instituted on a working day.",
          },
          {
            question: "What are other benefits besides scholarships?",
            answer:
              "Officers can apply for half-pay or no-pay study leave if not eligible for a scholarship.",
          },
          {
            question:
              "What services does the Psychology Development Unit offer?",
            answer:
              "They provide psychological testing, counseling, advisory services, and career guidance.",
          },
          {
            question: "What is counseling?",
            answer:
              "A relationship between a counselor and client focused on personal change and development.",
          },
        ],
      },
      {
        category: "Maritime Division",
        questions: [
          {
            question: "What is DSL (Domestic Shipping License)?",
            answer:
              "A license required for ships operating within Malaysian waters under the Cabotage Policy.",
          },
          {
            question: "What are the conditions to obtain a DSL?",
            answer:
              "Applicants must be Malaysian citizens or companies with a majority Malaysian shareholding.",
          },
          {
            question: "How many ports are under the Ministry of Transport?",
            answer:
              "There are 105 landing facilities, categorized into major and minor ports.",
          },
        ],
      },
      {
        category: "Land and Logistic Division",
        questions: [
          {
            question:
              "How can disabled individuals (OKU) get a driver’s license?",
            answer:
              "They follow the standard process, with modified vehicles allowed for the practical test.",
          },
          {
            question: "What is a tail summons, and who issues it?",
            answer:
              "It’s a notice from the police requiring the owner to provide the driver’s details for a traffic offense.",
          },
          {
            question: "How to apply for a train land lease?",
            answer:
              "Applications can be made using the PAK/H-01 form or directly at the Railway Assets Corporation.",
          },
        ],
      },
      {
        category: "Aviation Division",
        questions: [
          {
            question: "How many international airports are in Malaysia?",
            answer:
              "There are 7 international airports, including KLIA, Penang, and Langkawi.",
          },
          {
            question: "What airports handle international flights?",
            answer:
              "Airports like Kota Bharu, Subang, and Sandakan also handle international flights.",
          },
          {
            question: "What is the difference between airports and airstrips?",
            answer:
              "Airports have control towers and can handle larger aircraft compared to airstrips.",
          },
        ],
      },
      {
        category: "Information Management Division",
        questions: [
          {
            question: "What personal data is collected?",
            answer: "No personal data is collected unless provided via email.",
          },
          {
            question: "What happens when I link to another site?",
            answer:
              "The privacy policy of the linked site applies, and users should read it carefully.",
          },
        ],
      },
    ],
  };

  const source_my = {
    faq: [
      {
        category: "Aplikasi MyJPJ",
        questions: [
          {
            question: "Adakah muat turun MyJPJ wajib?",
            answer:
              "Tidak. Ia hanyalah salah satu pilihan untuk mendapatkan salinan digital cukai jalan dan lesen memandu.",
          },
          {
            question:
              "Adakah saya akan disaman jika tidak dapat menunjukkan cukai jalan digital?",
            answer:
              "Tidak. Pegawai penguatkuasa boleh mengesahkan status melalui peranti mereka.",
          },
          {
            question:
              "Adakah cukai jalan dan lesen perlu diperbaharui selepas tamat tempoh?",
            answer:
              "Ya. Anda perlu memperbaharui cukai jalan dan lesen. Hanya pelekat tidak perlu ditampal.",
          },
          {
            question:
              "Bagaimana jika warga emas atau mereka tanpa telefon pintar memerlukan bukti?",
            answer:
              "Jangan risau. Format digital tidak wajib. Anda masih boleh mendapatkan pelekat cukai jalan dan lesen fizikal.",
          },
          {
            question:
              "Bagaimana menunjukkan cukai jalan digital jika kereta dipandu oleh orang lain?",
            answer:
              "Cukai jalan digital boleh dicetak dan disimpan dalam kereta. Pegawai penguatkuasa boleh mengesahkan status melalui sistem mereka jika diperlukan.",
          },
          {
            question: "Kenapa saya tidak dapat log masuk ke MyJPJ?",
            answer:
              "Kemungkinan disebabkan trafik tinggi kerana ramai pengguna cuba mendaftar pada masa yang sama.",
          },
        ],
      },
      {
        category: "Biro Penyiasatan Kemalangan Udara (AAIB)",
        questions: [
          {
            question: "Bagaimana cara melaporkan kemalangan pesawat?",
            answer:
              "Laporkan kepada AAIB menggunakan borang yang ditetapkan dan e-mel kepada AAIB@mot.gov.my.",
          },
          {
            question: "Siapa yang perlu melaporkan kemalangan pesawat?",
            answer:
              "Kru pesawat, pemilik, pengendali, dan kakitangan penyelenggaraan diwajibkan melaporkan kemalangan.",
          },
          {
            question: "Apakah maklumat yang diperlukan oleh AAIB?",
            answer:
              "Jenis, model, tanda pendaftaran pesawat, tarikh dan masa kejadian, serta maklumat kru dan penumpang.",
          },
          {
            question: "Apakah peringkat laporan siasatan?",
            answer:
              "Terdapat lima peringkat: Notifikasi, Laporan Awal, Draf Laporan Akhir, Laporan Akhir, dan Kenyataan Interim.",
          },
        ],
      },
      {
        category: "Bahagian Pengurusan dan Kewangan",
        questions: [
          {
            question: "Apa itu aset boleh alih?",
            answer:
              "Aset yang boleh dipindahkan dari satu tempat ke tempat lain, termasuk yang dipasang bersama bangunan.",
          },
          {
            question: "Apakah maksud aset modal?",
            answer:
              "Aset dengan nilai asal RM1,000 atau lebih, atau aset yang memerlukan penyelenggaraan berkala.",
          },
          {
            question: "Apa definisi inventori?",
            answer:
              "Aset yang bernilai kurang daripada RM1,000 dan tidak memerlukan penyelenggaraan berkala.",
          },
          {
            question:
              "Bagaimana syarikat boleh menyertai tender atau sebut harga?",
            answer:
              "Syarikat berdaftar boleh menyertai melalui laman e-Bidding atau sistem Kementerian Pengangkutan.",
          },
          {
            question: "Bilakah permohonan pendahuluan perlu dibuat?",
            answer:
              "Permohonan mesti dihantar sekurang-kurangnya seminggu sebelum tarikh perjalanan.",
          },
          {
            question: "Berapa lama proses pembayaran tuntutan?",
            answer:
              "Tuntutan lengkap diproses dalam masa 14 hari jika amaun melebihi RM50,000 tetapi kurang daripada RM500,000.",
          },
        ],
      },
      {
        category: "Bahagian Sumber Manusia",
        questions: [
          {
            question: "Bagaimana elaun memangku dikira?",
            answer:
              "Elaun memangku adalah berdasarkan perbezaan gaji permulaan jawatan dengan gaji semasa pegawai.",
          },
          {
            question: "Bagaimana menentukan kekananan pegawai?",
            answer:
              "Berdasarkan tarikh pelantikan tetap untuk gred jawatan dan tarikh mengisi jawatan untuk gred kenaikan pangkat.",
          },
          {
            question: "Bolehkah tugasan dijalankan pada hari cuti?",
            answer: "Tugasan mesti dijalankan pada hari bekerja.",
          },
          {
            question:
              "Apakah perkhidmatan yang disediakan oleh Unit Pembangunan Psikologi?",
            answer:
              "Perkhidmatan ujian psikologi, kaunseling, nasihat, dan bimbingan kerjaya.",
          },
          {
            question: "Apa itu kaunseling?",
            answer:
              "Kaunseling adalah proses membina hubungan antara kaunselor dan klien untuk perubahan dan penyesuaian peribadi.",
          },
        ],
      },
      {
        category: "Bahagian Maritim",
        questions: [
          {
            question: "Apa itu DSL?",
            answer:
              "DSL ialah lesen untuk kapal yang beroperasi dalam perairan Malaysia mengikut Polisi Kabotaj.",
          },
          {
            question: "Apakah syarat untuk mendapatkan DSL?",
            answer:
              "Pemohon mestilah warganegara Malaysia atau syarikat dengan pemilikan majoriti warga Malaysia.",
          },
          {
            question:
              "Berapa banyak pelabuhan di bawah Kementerian Pengangkutan?",
            answer:
              "Terdapat 105 kemudahan pendaratan, termasuk pelabuhan utama dan kecil.",
          },
        ],
      },
      {
        category: "Bahagian Penerbangan",
        questions: [
          {
            question:
              "Berapa banyak lapangan terbang antarabangsa di Malaysia?",
            answer:
              "Terdapat 7 lapangan terbang antarabangsa, termasuk KLIA, Penang, dan Langkawi.",
          },
          {
            question:
              "Apakah perbezaan antara lapangan terbang dan landasan udara?",
            answer:
              "Lapangan terbang mempunyai menara kawalan dan boleh menerima pesawat besar, berbanding landasan udara.",
          },
          {
            question:
              "Apakah perbezaan antara penerbangan berjadual dan tidak berjadual?",
            answer:
              "Penerbangan berjadual mengikut jadual tetap, manakala penerbangan tidak berjadual tidak mengikut jadual yang konsisten.",
          },
        ],
      },
    ],
  };
});
