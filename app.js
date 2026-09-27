// Quote data lives here (not in a .json file) so the app works when index.html
// is opened directly from disk — fetch() on file:// is blocked by CORS.
const QUOTES = [
    {
        text: "Start before you're ready.",
        author: "Steven Pressfield",
        image: "images/sunrise.svg",
        alt: "A sun rising over the horizon"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        image: "images/path.svg",
        alt: "A dotted trail winding up towards a flag"
    },
    {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu",
        image: "images/mountain.svg",
        alt: "Two mountain peaks, the nearest one snow capped"
    },
    {
        text: "Fall seven times, stand up eight.",
        author: "Japanese proverb",
        image: "images/seed.svg",
        alt: "A young seedling pushing up out of the ground"
    },
    {
        text: "Whether you think you can or you think you can't, you're right.",
        author: "Henry Ford",
        image: "images/compass.svg",
        alt: "A compass with its needle pointing north east"
    },
    {
        text: "Simplicity is the ultimate sophistication.",
        author: "Leonardo da Vinci",
        image: "images/lightbulb.svg",
        alt: "A glowing light bulb"
    },
    {
        text: "A ship in harbor is safe, but that is not what ships are built for.",
        author: "John A. Shedd",
        image: "images/boat.svg",
        alt: "A sailboat on open water"
    },
    {
        text: "The best time to plant a tree was twenty years ago. The second best time is now.",
        author: "Chinese proverb",
        image: "images/clock.svg",
        alt: "A clock face showing the hands at a quarter past"
    },
    {
        text: "What we do now echoes in eternity.",
        author: "Marcus Aurelius",
        image: "images/bridge.svg",
        alt: "An arched bridge spanning a gap"
    },
    {
        text: "Shoot for the moon. Even if you miss, you'll land among the stars.",
        author: "Norman Vincent Peale",
        image: "images/stars.svg",
        alt: "A crescent moon surrounded by stars"
    }
];

const card = document.getElementById("card");
const imageEl = document.getElementById("quote-image");
const textEl = document.getElementById("quote-text");
const authorEl = document.getElementById("quote-author");
const statusEl = document.getElementById("status");

let currentIndex = 0;
let queue = [];
let statusTimer = null;

// Shuffled queue rather than Math.random() each click, so every quote is seen
// once before any repeats and you never get the same one twice in a row.
function refillQueue() {
    queue = QUOTES.map((_, i) => i).filter(i => i !== currentIndex);
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
}

function render(quote) {
    imageEl.src = quote.image;
    imageEl.alt = quote.alt;
    textEl.textContent = quote.text;
    authorEl.textContent = quote.author;
}

function animate() {
    card.classList.remove("is-animating");
    void card.offsetWidth; // force reflow so the animation restarts
    card.classList.add("is-animating");
}

function showStatus(message) {
    statusEl.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = ""; }, 2500);
}

function nextQuote() {
    if (queue.length === 0) refillQueue();
    currentIndex = queue.pop();
    render(QUOTES[currentIndex]);
    animate();
    statusEl.textContent = "";
}

// execCommand is deprecated but still the only thing that works on file://,
// where navigator.clipboard is unavailable outside a secure context.
function legacyCopy(payload) {
    const field = document.createElement("textarea");
    field.value = payload;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "0";
    field.style.width = "1px";
    field.style.height = "1px";
    field.style.padding = "0";
    field.style.border = "none";
    field.style.opacity = "0";
    document.body.appendChild(field);

    // Preserve whatever the user already had selected on the page.
    const selection = document.getSelection();
    const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    field.focus();
    field.select();
    field.setSelectionRange(0, payload.length); // iOS Safari ignores select() alone

    let ok = false;
    try {
        ok = document.execCommand("copy");
    } catch (err) {
        ok = false;
    }

    document.body.removeChild(field);
    if (previous && selection) {
        selection.removeAllRanges();
        selection.addRange(previous);
    }
    return ok;
}

async function copyQuote() {
    const quote = QUOTES[currentIndex];
    const payload = '"' + quote.text + '" — ' + quote.author;

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(payload);
            showStatus("Copied to clipboard");
            return;
        } catch (err) {
            // fall through to the legacy path
        }
    }

    showStatus(legacyCopy(payload) ? "Copied to clipboard" : "Press Ctrl/Cmd+C to copy");
}

document.getElementById("new-quote").addEventListener("click", nextQuote);
document.getElementById("copy-quote").addEventListener("click", copyQuote);

// Start on a random quote so the page isn't identical on every load.
currentIndex = Math.floor(Math.random() * QUOTES.length);
render(QUOTES[currentIndex]);
refillQueue();
