/* CONTENT: edit text, links, and example projects here. No HTML needed. */
window.TT = window.TT || {};

TT.steps = [
  { title: "Find a problem",     text: "Notice something that annoys you or people near you." },
  { title: "Research it",        text: "Check if someone already solved it, and what they missed." },
  { title: "Sketch ideas",       text: "Draw three different solutions before you pick one." },
  { title: "Build a prototype",  text: "Use cardboard, code, or a cheap kit. Rough is fine." },
  { title: "Test and share",     text: "Ask people to try it, improve it, then post it here." }
];

TT.resources = [
  { tag: "Inventing",   title: "Lemelson-MIT",          text: "Stories, guides and programs for young inventors.",       url: "https://lemelson.mit.edu/" },
  { tag: "Making",      title: "Instructables",         text: "Step-by-step builds for electronics, wood and more.",     url: "https://www.instructables.com/" },
  { tag: "Electronics", title: "Arduino Docs",          text: "Tutorials for sensors, motors and small circuits.",       url: "https://docs.arduino.cc/" },
  { tag: "Coding",      title: "Scratch",               text: "Learn to code by building games and animations.",         url: "https://scratch.mit.edu/" },
  { tag: "Science",     title: "Khan Academy Physics",  text: "Free lessons on forces, energy and circuits.",            url: "https://www.khanacademy.org/science/physics" },
  { tag: "Protect it",  title: "IP for Kids (WIPO)",    text: "What patents and copyright mean for your idea.",          url: "https://www.wipo.int/en/web/ip-for-kids" },
  { tag: "Inspiration", title: "Don Labs", text: "Watch what happens when young inventors build their ideas.", url: "https://donlabs.lat/Home" }
];

/* Placeholder projects. Delete these once real posts exist. */
TT.examples = [
  { title: "Rain-powered plant waterer",  who: "Example", kind: "Invention",      desc: "A small tank and valve that waters pots using collected rainwater." },
  { title: "Cheaper braille label maker", who: "Example", kind: "Tech idea",      desc: "A concept using a 3D printer pen to make braille labels at home." },
  { title: "How solar chargers lose power", who: "Example", kind: "Research paper", desc: "A short paper on shade, heat and angle, with measurements." }
];

/* Emoji shown on each card by project type. Keep in sync with the <select> in index.html. */
TT.kindIcons = { "Invention": "💡", "Research paper": "📄", "Tech idea": "🔧" };
