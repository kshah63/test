import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedActivity = {
  slug: string;
  title: string;
  summary: string;
  steps: string[];
  materials: string[];
  category: "motor" | "language" | "sensory" | "cognitive" | "social";
  benefit: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  isPremium?: boolean;
};

const activities: SeedActivity[] = [
  // ─── 0–3 months ────────────────────────────────────────────────
  {
    slug: "face-time-tracking",
    title: "Face Time & Slow Tracking",
    summary:
      "Hold your face 8–12 inches from baby's and slowly move side to side so they practice following you with their eyes.",
    steps: [
      "Lay baby on their back or hold them cradled, calm and fed.",
      "Bring your face about 8–12 inches from theirs — that's the distance newborns can focus.",
      "Talk softly and smile, then slowly move your face to one side.",
      "Wait for their eyes (and later their head) to follow, then drift the other way.",
      "Stop when baby looks away — that's them telling you they're done.",
    ],
    materials: ["Just you"],
    category: "sensory",
    benefit:
      "Visual tracking wires up the eye muscles and the brain's visual cortex, and face study is how babies begin social learning.",
    ageMinMonths: 0,
    ageMaxMonths: 3,
  },
  {
    slug: "tummy-time-hello",
    title: "Tummy Time Hello",
    summary:
      "Short, supported tummy time with your face at baby's level to build the neck and core strength behind every later milestone.",
    steps: [
      "Place a blanket on a firm, safe surface and lay baby on their tummy.",
      "Get down so you're face-to-face at their eye level.",
      "Talk, sing, and click your tongue to encourage them to lift their head.",
      "Slide a rolled towel under their chest if they get frustrated.",
      "Aim for 1–2 minutes at a time, a few rounds — end before tears.",
    ],
    materials: ["Blanket", "Rolled towel (optional)"],
    category: "motor",
    benefit:
      "Tummy time builds the neck, shoulder and core strength that rolling, sitting and crawling are built on.",
    ageMinMonths: 0,
    ageMaxMonths: 4,
  },
  {
    slug: "narrate-your-day",
    title: "Narrate Your Day",
    summary:
      "Give baby a play-by-play of whatever you're doing — folding laundry, making tea — in a warm, sing-song voice.",
    steps: [
      "Pick any ordinary task while baby is nearby and alert.",
      "Describe each step out loud: \"Now I'm pouring the warm water…\"",
      "Use that natural sing-song 'parentese' pitch — babies' brains lock onto it.",
      "Pause after sentences and look at baby, as if waiting for a reply.",
      "Respond to any coo or wiggle: \"Oh really? Tell me more!\"",
    ],
    materials: ["Just you"],
    category: "language",
    benefit:
      "The number of words a baby hears — served with warm back-and-forth — is one of the strongest predictors of later language.",
    ageMinMonths: 0,
    ageMaxMonths: 12,
  },
  {
    slug: "high-contrast-gallery",
    title: "High-Contrast Gallery",
    summary:
      "Show baby bold black-and-white patterns and watch them study each one like tiny art critics.",
    steps: [
      "Draw thick stripes, checks, or a simple face on white paper with a black marker.",
      "Hold one card 8–12 inches from baby's face.",
      "Let them stare as long as they like — staring is studying.",
      "Swap to a new pattern when their gaze drifts.",
      "Describe what they see: \"Stripes! Up and down, up and down.\"",
    ],
    materials: ["White paper", "Black marker"],
    category: "sensory",
    benefit:
      "High-contrast edges are what a newborn's visual system can process best; studying them accelerates visual brain development.",
    ageMinMonths: 0,
    ageMaxMonths: 4,
  },
  {
    slug: "skin-to-skin-songs",
    title: "Skin-to-Skin Song Time",
    summary:
      "Hold baby against your chest and sing slow songs — your heartbeat and voice are their favourite sensory input.",
    steps: [
      "Get comfortable in a chair with baby on your bare chest (nappy on!).",
      "Sing anything slow and gentle — lullabies or your own favourites.",
      "Sway or pat their back in rhythm with the song.",
      "Repeat the same two or three songs daily so they become familiar.",
      "Notice baby's breathing slow and settle — that's regulation in action.",
    ],
    materials: ["Just you"],
    category: "social",
    benefit:
      "Skin-to-skin contact regulates heart rate and stress hormones, and repeated melodies build early memory and bonding.",
    ageMinMonths: 0,
    ageMaxMonths: 6,
    isPremium: true,
  },
  {
    slug: "gentle-bicycle-legs",
    title: "Bicycle Legs & Body Map",
    summary:
      "Gently cycle baby's legs and name each body part you touch to build their internal body map.",
    steps: [
      "Lay baby on their back after a nappy change.",
      "Hold their calves and gently cycle their legs: \"pedal, pedal, pedal!\"",
      "Pause, then stretch arms up and down slowly.",
      "Name and squeeze each part gently: \"These are your feet!\"",
      "Keep eye contact and stop if baby stiffens or fusses.",
    ],
    materials: ["Changing mat or blanket"],
    category: "motor",
    benefit:
      "Gentle guided movement plus naming builds proprioception — the brain's map of the body — and eases digestion too.",
    ageMinMonths: 0,
    ageMaxMonths: 5,
    isPremium: true,
  },

  // ─── 3–6 months ────────────────────────────────────────────────
  {
    slug: "reach-and-grab",
    title: "Reach & Grab Practice",
    summary:
      "Dangle interesting objects just within reach so baby practices judging distance and grabbing.",
    steps: [
      "Lay baby on their back under a play gym, or hold a toy above them.",
      "Hold a rattle or bright ring about an arm's length away.",
      "Wiggle it and wait — let them work out the reach themselves.",
      "Celebrate any contact: \"You got it!\"",
      "Move it slightly left or right to make each reach a new puzzle.",
    ],
    materials: ["Rattle or lightweight toy"],
    category: "motor",
    benefit:
      "Reaching is a hand-eye coordination workout that links what baby sees with how their body moves.",
    ageMinMonths: 3,
    ageMaxMonths: 7,
  },
  {
    slug: "mirror-buddy",
    title: "Mirror Buddy",
    summary:
      "Sit with baby in front of a mirror and let them meet the fascinating baby looking back.",
    steps: [
      "Sit baby on your lap facing a mirror, or use an unbreakable baby mirror.",
      "Point to their reflection: \"Who's that? That's Maya!\"",
      "Wave, make faces, and name feelings: \"Look at that happy smile!\"",
      "Touch their nose and point to it in the mirror.",
      "Let them lean in, pat, and 'talk' to their reflection.",
    ],
    materials: ["Mirror"],
    category: "social",
    benefit:
      "Mirror play fuels self-recognition, attention, and social-emotional wiring — babies are drawn to faces above all else.",
    ageMinMonths: 3,
    ageMaxMonths: 12,
  },
  {
    slug: "texture-tour",
    title: "Texture Tour",
    summary:
      "Guide baby's hands over different textures around the house — soft, bumpy, cool, fuzzy.",
    steps: [
      "Gather 4–5 safe textures: silk scarf, wooden spoon, sponge, knitted hat, cold (sealed) water bottle.",
      "Brush each one gently over baby's palm and let them grip it.",
      "Name the feeling each time: \"Soft… soft scarf.\"",
      "Watch which ones fascinate them and repeat those.",
      "Supervise closely — everything heads to the mouth at this age (that's learning too).",
    ],
    materials: ["4–5 household items with different textures"],
    category: "sensory",
    benefit:
      "Varied touch input builds rich sensory maps in the brain and pairs each texture with its word.",
    ageMinMonths: 3,
    ageMaxMonths: 9,
  },
  {
    slug: "sound-safari",
    title: "Sound Safari",
    summary:
      "Make sounds from different spots in the room and let baby hunt for them by turning their head.",
    steps: [
      "Sit baby somewhere supported where they can turn their head freely.",
      "Move out of view and shake a rattle to one side.",
      "Wait for them to turn toward it, then pop into view: \"You found it!\"",
      "Try different sounds: crinkly paper, a bell, your voice whispering.",
      "Switch sides and distances to keep the hunt interesting.",
    ],
    materials: ["Rattle, bell, or crinkly paper"],
    category: "cognitive",
    benefit:
      "Locating sounds builds auditory processing and teaches cause-and-effect — a sound means something is there.",
    ageMinMonths: 3,
    ageMaxMonths: 8,
    isPremium: true,
  },
  {
    slug: "rolling-encouragement",
    title: "Rolling Practice",
    summary:
      "Use a favourite toy to tempt baby into rolling from back to side and eventually all the way over.",
    steps: [
      "Lay baby on their back on a firm blanket.",
      "Hold a favourite toy where they can see it, then move it slowly to one side.",
      "As they twist to follow, rest their opposite leg across their body to help the roll begin.",
      "Let them do the last part themselves — the struggle is the exercise.",
      "Big celebration on every attempt, successful or not.",
    ],
    materials: ["Blanket", "Favourite toy"],
    category: "motor",
    benefit:
      "Rolling is baby's first big self-driven movement — it builds core strength and teaches that effort moves their world.",
    ageMinMonths: 3,
    ageMaxMonths: 7,
    isPremium: true,
  },

  // ─── 6–12 months ───────────────────────────────────────────────
  {
    slug: "peekaboo-plus",
    title: "Peekaboo Plus",
    summary:
      "Classic peekaboo, then level it up by hiding toys under cloths for baby to uncover.",
    steps: [
      "Start with classic peekaboo behind your hands a few times.",
      "Then show baby a toy and slowly hide it under a cloth while they watch.",
      "Ask: \"Where did it go?\" and wait.",
      "Help them pull the cloth off — gasp with delight at the reveal.",
      "Repeat until they whip the cloth off themselves like a tiny magician.",
    ],
    materials: ["Small cloth or muslin", "Small toy"],
    category: "cognitive",
    benefit:
      "This trains object permanence — knowing things still exist when out of sight — a landmark of infant cognition.",
    ageMinMonths: 6,
    ageMaxMonths: 12,
  },
  {
    slug: "container-play",
    title: "In & Out Container Play",
    summary:
      "Give baby a container and safe objects to drop in, dump out, and repeat approximately one million times.",
    steps: [
      "Offer a wide plastic bowl and a few large-ish safe objects (blocks, silicone cups).",
      "Demonstrate dropping one in — pause for the satisfying 'clunk'.",
      "Hand baby an object and hold the bowl out.",
      "Cheer every drop; show them how to tip the bowl to dump everything out.",
      "Let the fill–dump–repeat loop run as long as it holds their attention.",
    ],
    materials: ["Plastic bowl or box", "Blocks or stacking cups"],
    category: "motor",
    benefit:
      "Releasing an object on purpose is surprisingly hard — this builds fine motor control and early spatial reasoning.",
    ageMinMonths: 6,
    ageMaxMonths: 14,
  },
  {
    slug: "point-and-name",
    title: "Point & Name Walk",
    summary:
      "Carry baby around the house or garden, pointing at and naming everything that catches their eye.",
    steps: [
      "Carry baby facing outward or on your hip.",
      "Follow their gaze — when they stare at something, point at it.",
      "Name it clearly, twice: \"Lamp. That's the lamp.\"",
      "Add one fun detail: \"The lamp gives us light!\"",
      "Let them touch safe things as you name them.",
    ],
    materials: ["Just you"],
    category: "language",
    benefit:
      "Joint attention — you and baby focusing on the same thing while you name it — is the engine of vocabulary growth.",
    ageMinMonths: 6,
    ageMaxMonths: 18,
  },
  {
    slug: "banana-mash-lab",
    title: "Messy Food Lab",
    summary:
      "Let baby squish, smear, and taste soft foods with their bare hands. Messy, yes. Science, also yes.",
    steps: [
      "Strip baby to their nappy and put them in the high chair.",
      "Offer small piles of 2–3 soft foods: banana, avocado, cooked pasta.",
      "Let them squish and explore freely — no agenda, no wiping mid-play.",
      "Name textures and tastes as they go: \"Squishy banana!\"",
      "Bath or wipe-down after — the mess is the point.",
    ],
    materials: ["Soft foods", "High chair", "Towel for after"],
    category: "sensory",
    benefit:
      "Multi-sensory food play builds sensory integration and is linked to less picky eating later on.",
    ageMinMonths: 6,
    ageMaxMonths: 15,
    isPremium: true,
  },
  {
    slug: "cruise-course",
    title: "Cruising Course",
    summary:
      "Line up sofa cushions and low furniture into a course that tempts baby to pull up and cruise along.",
    steps: [
      "Arrange a stable sofa, ottoman, and cushions in a line with small gaps.",
      "Place favourite toys at intervals along the top edge.",
      "Help baby pull to standing at one end.",
      "Let them side-step toward each toy at their own pace.",
      "Stay close, celebrate wobbles and recoveries alike.",
    ],
    materials: ["Sofa/low furniture", "A few favourite toys"],
    category: "motor",
    benefit:
      "Cruising builds leg strength, balance and the confidence that leads directly to first steps.",
    ageMinMonths: 8,
    ageMaxMonths: 14,
    isPremium: true,
  },
  {
    slug: "copycat-gestures",
    title: "Copycat Gestures",
    summary:
      "Play a wave-clap-boop imitation game — baby's first conversation without words.",
    steps: [
      "Sit face-to-face where baby can see your hands.",
      "Do one clear gesture: wave, clap, or pat the table.",
      "Pause and wait expectantly — give them 10 full seconds.",
      "Celebrate any attempt to copy, even a twitch in the right direction.",
      "Copy *their* gestures too — imitation goes both ways.",
    ],
    materials: ["Just you"],
    category: "social",
    benefit:
      "Imitation is the foundation of all social learning, and gestures are a proven stepping stone to first words.",
    ageMinMonths: 7,
    ageMaxMonths: 15,
  },

  // ─── 12–24 months ──────────────────────────────────────────────
  {
    slug: "stack-and-crash",
    title: "Stack & Crash Towers",
    summary:
      "Build block towers together — half the learning is in the building, half in the glorious crash.",
    steps: [
      "Sit on the floor with a pile of blocks or stacking cups.",
      "Build a tower slowly, counting each block out loud.",
      "Invite toddler to add blocks — steady their hand only if asked.",
      "When it falls (or gets demolished), cheer: \"CRASH! Let's build again!\"",
      "Count higher as their stacking improves over the weeks.",
    ],
    materials: ["Blocks or stacking cups"],
    category: "motor",
    benefit:
      "Stacking builds fine motor precision and early physics intuition; counting aloud plants number sense.",
    ageMinMonths: 12,
    ageMaxMonths: 30,
  },
  {
    slug: "book-and-point",
    title: "Point-It-Out Reading",
    summary:
      "Read a picture book interactively — asking 'where's the dog?' turns reading into a game.",
    steps: [
      "Pick a sturdy board book with big clear pictures.",
      "Let toddler hold it and turn pages, even out of order.",
      "Ask 'Where's the…?' questions and wait for them to point.",
      "When they point at anything, name it with enthusiasm.",
      "Follow their interest — reading three pages 10 times beats 10 pages once.",
    ],
    materials: ["Board book"],
    category: "language",
    benefit:
      "Interactive 'dialogic' reading builds vocabulary dramatically faster than reading straight through.",
    ageMinMonths: 12,
    ageMaxMonths: 36,
  },
  {
    slug: "kitchen-band",
    title: "Kitchen Band",
    summary:
      "Pots, pans, and wooden spoons become a drum kit. Loud? Yes. Brain-building? Also yes.",
    steps: [
      "Set out 3–4 upside-down pots and containers of different sizes.",
      "Hand out wooden spoons and demonstrate a few beats.",
      "Copy their rhythms, then see if they'll copy yours.",
      "Add a song — bang along to the beat of a favourite tune.",
      "Try loud vs quiet, fast vs slow: \"Can you play it tiny?\"",
    ],
    materials: ["Pots and pans", "Wooden spoons"],
    category: "sensory",
    benefit:
      "Rhythm-making builds auditory processing and motor timing — skills that later support both language and reading.",
    ageMinMonths: 12,
    ageMaxMonths: 36,
  },
  {
    slug: "toddler-chores",
    title: "Tiny Helper Time",
    summary:
      "Give your toddler one real job — wiping the table, putting socks in a drawer — and watch them glow.",
    steps: [
      "Pick one genuinely useful, doable job: put spoons in the drawer, drop clothes in the basket.",
      "Show them slowly, narrating each step.",
      "Hand it over and resist the urge to fix their technique.",
      "Thank them like a colleague: \"You put ALL the socks away. That helped me.\"",
      "Make it a daily ritual — same job, same time.",
    ],
    materials: ["A real household task"],
    category: "cognitive",
    benefit:
      "Real jobs build working memory, sequencing, and the deep confidence of genuine contribution.",
    ageMinMonths: 15,
    ageMaxMonths: 48,
    isPremium: true,
  },
  {
    slug: "obstacle-crawl",
    title: "Cushion Mountain Course",
    summary:
      "Build a soft obstacle course from cushions and blankets for climbing over, under, and through.",
    steps: [
      "Pile sofa cushions and pillows into 'mountains' on a carpet.",
      "Add a blanket over two chairs as a tunnel.",
      "Demonstrate the route: over the mountain, through the tunnel.",
      "Use position words as they move: over, under, through, around.",
      "Rebuild it differently next time so the route stays a fresh puzzle.",
    ],
    materials: ["Cushions", "Pillows", "Blanket", "Chairs"],
    category: "motor",
    benefit:
      "Climbing builds whole-body strength and motor planning, while position words wire up spatial language.",
    ageMinMonths: 12,
    ageMaxMonths: 42,
    isPremium: true,
  },
  {
    slug: "water-pour-station",
    title: "Pouring Station",
    summary:
      "Cups, water, and a towel on the floor — a concentration workout disguised as splashing.",
    steps: [
      "Lay a big towel down and set out 2–3 cups and a small jug, one-third full of water.",
      "Demonstrate one slow pour from jug to cup.",
      "Hand it over and let them pour, spill, refill and repeat.",
      "Add a funnel or sieve after a few sessions to level it up.",
      "Finish by mopping up together — that's part of the activity.",
    ],
    materials: ["Plastic cups & jug", "Water", "Big towel"],
    category: "sensory",
    benefit:
      "Pouring demands intense focus and precise wrist control — classic Montessori work for concentration-building.",
    ageMinMonths: 15,
    ageMaxMonths: 48,
  },

  // ─── 2–3 years ─────────────────────────────────────────────────
  {
    slug: "pretend-kitchen",
    title: "Pretend Café",
    summary:
      "Order lunch at your toddler's imaginary café — pretend play is serious cognitive work.",
    steps: [
      "Set up a 'café' with play food or empty containers.",
      "Be the customer: \"Hello! What's good here today?\"",
      "Order something and pay with pretend money or leaves.",
      "React big to whatever they serve: \"Mmm, the best leaf soup I've ever had!\"",
      "Swap roles and let them be the customer.",
    ],
    materials: ["Play food or safe kitchen items"],
    category: "social",
    benefit:
      "Pretend play builds symbolic thinking — the mental leap behind language, imagination, and later abstract reasoning.",
    ageMinMonths: 24,
    ageMaxMonths: 48,
  },
  {
    slug: "color-hunt",
    title: "Colour Hunt",
    summary:
      "Pick a colour and race around the house finding everything that matches.",
    steps: [
      "Announce today's colour and find one example together: \"Red! Like this cup.\"",
      "Hunt around the house collecting or pointing at red things.",
      "Count the haul together at the end.",
      "Ask a follow-up: \"Which red thing is the biggest?\"",
      "Tomorrow, new colour.",
    ],
    materials: ["Just your house"],
    category: "cognitive",
    benefit:
      "Categorizing by colour builds sorting and classification — foundational math thinking — plus focused attention.",
    ageMinMonths: 24,
    ageMaxMonths: 48,
  },
  {
    slug: "playdough-sculptor",
    title: "Playdough Sculptor",
    summary:
      "Squish, roll, and snip playdough into snakes, balls, and monsters.",
    steps: [
      "Give each of you a ball of playdough.",
      "Model one simple make: roll a snake, coil it into a snail.",
      "Let them squash yours and make their own creations.",
      "Narrate techniques: rolling, pinching, flattening, poking.",
      "Add child-safe scissors for snipping snakes — great scissor prep.",
    ],
    materials: ["Playdough", "Child-safe scissors (optional)"],
    category: "motor",
    benefit:
      "Playdough strengthens exactly the hand muscles needed for pencil grip and writing later on.",
    ageMinMonths: 24,
    ageMaxMonths: 60,
  },
  {
    slug: "feelings-faces",
    title: "Feelings Faces Game",
    summary:
      "Make happy, sad, cross and surprised faces at each other and guess the feeling.",
    steps: [
      "Sit face-to-face and make an exaggerated happy face: \"How do I feel?\"",
      "Let them guess, then swap — they make a face, you guess.",
      "Add feelings to the deck gradually: cross, scared, surprised, sleepy.",
      "Link to real life: \"Remember when you felt cross this morning?\"",
      "Finish with 'silly face' free-for-all.",
    ],
    materials: ["Just you"],
    category: "social",
    benefit:
      "Naming emotions builds emotional literacy — kids who can name feelings are better at managing them.",
    ageMinMonths: 24,
    ageMaxMonths: 60,
    isPremium: true,
  },
  {
    slug: "sticker-line-walk",
    title: "Tape-Line Tightrope",
    summary:
      "A line of masking tape on the floor becomes a tightrope, a road, and a balance beam.",
    steps: [
      "Stick a long line of masking tape across the floor — add zigzags and curves.",
      "Walk it like a tightrope, arms out, one foot in front of the other.",
      "Try it backwards, sideways, tip-toe, and with a beanbag on your head.",
      "Pretend the floor is lava for extra motivation.",
      "Leave the tape down for days of repeat play.",
    ],
    materials: ["Masking tape"],
    category: "motor",
    benefit:
      "Balance work builds the vestibular system and body control that underpin sports, sitting still, and even focus.",
    ageMinMonths: 24,
    ageMaxMonths: 60,
    isPremium: true,
  },

  // ─── 3–4 years ─────────────────────────────────────────────────
  {
    slug: "story-what-next",
    title: "What Happens Next?",
    summary:
      "Pause mid-story and let your child invent what happens next — then read on and compare.",
    steps: [
      "Read a familiar picture book but stop at a key moment.",
      "Ask: \"What do you think happens next?\"",
      "Take their answer seriously — ask one 'why' follow-up.",
      "Read on and compare: \"You said the bear would hide — he climbed a tree!\"",
      "Later, invite full alternative endings.",
    ],
    materials: ["Picture book"],
    category: "language",
    benefit:
      "Prediction turns passive listening into active reasoning — building narrative skills and comprehension for reading.",
    ageMinMonths: 36,
    ageMaxMonths: 72,
  },
  {
    slug: "sorting-scientist",
    title: "Sorting Scientist",
    summary:
      "Dump out the toy bin and sort everything by colour, then size, then 'has wheels' — like a real scientist.",
    steps: [
      "Gather a mixed pile: blocks, cars, animals, spoons.",
      "Sort together into two bowls by an easy rule (colour).",
      "Re-sort the same pile by a new rule: big/small, soft/hard.",
      "Let them invent a rule and you guess what it is.",
      "That guessing game — spotting the hidden rule — is the best bit.",
    ],
    materials: ["Mixed small toys", "Two bowls or trays"],
    category: "cognitive",
    benefit:
      "Sorting by shifting rules builds cognitive flexibility and classification — core pre-math and executive function skills.",
    ageMinMonths: 30,
    ageMaxMonths: 60,
  },
  {
    slug: "simon-says-junior",
    title: "Simon Says, Junior Edition",
    summary:
      "The classic listen-and-move game, tuned for preschool attention spans.",
    steps: [
      "Explain: only move when you hear 'Simon says'.",
      "Start with all 'Simon says' commands so everyone wins: touch your nose, hop, wiggle.",
      "Sneak in a trick command and laugh together when someone moves.",
      "Speed up, slow down, add two-step commands: \"Simon says touch your head then clap.\"",
      "Swap roles: your child becomes Simon.",
    ],
    materials: ["Just you"],
    category: "cognitive",
    benefit:
      "Inhibiting an action on cue is a direct workout for impulse control — a top predictor of school readiness.",
    ageMinMonths: 36,
    ageMaxMonths: 72,
  },
  {
    slug: "nature-collector",
    title: "Nature Collector",
    summary:
      "A ten-minute walk with a paper bag: collect leaves, stones and sticks, then inspect the treasure at home.",
    steps: [
      "Head out with a paper bag: \"We're collectors today.\"",
      "Gather anything interesting: leaves, seed pods, smooth stones.",
      "At home, lay the finds on a tray and inspect them together.",
      "Compare: roughest? Heaviest? Which smells like anything?",
      "Keep the best find on a 'museum shelf'.",
    ],
    materials: ["Paper bag", "Outdoor space"],
    category: "sensory",
    benefit:
      "Collecting and comparing natural objects builds observation skills and scientific curiosity.",
    ageMinMonths: 30,
    ageMaxMonths: 72,
    isPremium: true,
  },
  {
    slug: "counting-shop",
    title: "Counting Shop",
    summary:
      "Set up a tiny shop where everything costs a few buttons — early math disguised as pretend play.",
    steps: [
      "Set out 5–6 toys as shop stock with 'prices' of 1–5.",
      "Give your child ten buttons or coins as money.",
      "You shopkeep first: \"That's the 3-button bear, please.\"",
      "Count the buttons into your hand together, one by one.",
      "Swap roles — them running the till is where the math happens.",
    ],
    materials: ["Buttons or coins", "A few toys"],
    category: "cognitive",
    benefit:
      "Counting out objects one-by-one builds one-to-one correspondence — the true foundation of arithmetic.",
    ageMinMonths: 36,
    ageMaxMonths: 72,
    isPremium: true,
  },

  // ─── 4–6 years ─────────────────────────────────────────────────
  {
    slug: "letter-sound-ispy",
    title: "Sound I-Spy",
    summary:
      "I-spy, but with letter sounds: \"something that starts with mmm…\" — pre-reading in game form.",
    steps: [
      "Pick an object in view and give its starting sound (the sound, not the letter name): \"sss\".",
      "Let them guess with hints as needed.",
      "Swap: they pick and give you the sound (help quietly if stuck).",
      "Level up with ending sounds: \"…ends with t\".",
      "Play anywhere — queues, car rides, dinner table.",
    ],
    materials: ["Just you"],
    category: "language",
    benefit:
      "Hearing the individual sounds inside words — phonemic awareness — is the single strongest predictor of learning to read.",
    ageMinMonths: 48,
    ageMaxMonths: 78,
  },
  {
    slug: "draw-your-day",
    title: "Draw Your Day",
    summary:
      "Draw the best bit of today, then tell the story of the picture while you write their words down.",
    steps: [
      "Ask: \"What was the best bit of today? Draw it.\"",
      "Draw your own alongside — imperfectly, so theirs feels safe.",
      "Ask them to tell you the story of their picture.",
      "Write their exact words under the drawing as they watch.",
      "Read it back pointing at each word — their words became text!",
    ],
    materials: ["Paper", "Crayons or pencils"],
    category: "language",
    benefit:
      "Seeing their own speech written down teaches that print carries meaning — a key literacy breakthrough.",
    ageMinMonths: 48,
    ageMaxMonths: 78,
  },
  {
    slug: "board-game-basics",
    title: "Simple Board Game Night",
    summary:
      "A short dice-and-counters game: turn-taking, counting, and losing gracefully (mostly).",
    steps: [
      "Pick any simple race-to-the-end game, or draw a 20-square track on paper.",
      "Take turns rolling a die and counting moves square by square.",
      "Narrate feelings when luck strikes: \"Oh no, back three! Frustrating — deep breath.\"",
      "Don't engineer a win every time — losing safely is a skill.",
      "Rematch if they lose and want one.",
    ],
    materials: ["Simple board game, or paper + die + two coins"],
    category: "social",
    benefit:
      "Board games train turn-taking, counting on from a number, and emotional regulation under (tiny) pressure.",
    ageMinMonths: 48,
    ageMaxMonths: 78,
  },
  {
    slug: "build-challenge",
    title: "The Build Challenge",
    summary:
      "Set an engineering brief — 'build a bridge two cars can cross' — and let them iterate.",
    steps: [
      "Set a challenge: a bridge between two books, a tower taller than the teddy.",
      "Offer blocks, boxes, tape — anything on hand.",
      "When designs collapse, resist fixing: \"Hmm, what could make it stronger?\"",
      "Test together ceremonially at the end.",
      "Ask an engineer's question: \"What would you change next time?\"",
    ],
    materials: ["Blocks, boxes, tape"],
    category: "cognitive",
    benefit:
      "Open-ended building with constraints develops planning, persistence, and engineering thinking.",
    ageMinMonths: 42,
    ageMaxMonths: 78,
    isPremium: true,
  },
  {
    slug: "kitchen-scientist",
    title: "Fizzy Kitchen Science",
    summary:
      "Baking soda + vinegar volcanoes: prediction, observation, and delighted shrieking.",
    steps: [
      "Put a spoonful of baking soda in a cup on a tray.",
      "Ask for a prediction: \"What will happen when we add vinegar?\"",
      "Let them pour and watch the eruption.",
      "Experiment: more soda? Warm vinegar? A drop of food colouring?",
      "Introduce the word 'experiment' — they just did one.",
    ],
    materials: ["Baking soda", "Vinegar", "Cup and tray", "Food colouring (optional)"],
    category: "cognitive",
    benefit:
      "Predict–test–observe is the scientific method in miniature, and it builds hypothesis-making instincts.",
    ageMinMonths: 42,
    ageMaxMonths: 78,
    isPremium: true,
  },
  {
    slug: "emotion-charades",
    title: "Emotion Charades",
    summary:
      "Act out feelings and situations for each other to guess — empathy practice in disguise.",
    steps: [
      "Whisper or mime a scenario: 'you dropped your ice cream'.",
      "Act it out with your whole body — no words allowed.",
      "The guesser names both the event and the feeling.",
      "Discuss: \"What could help when you feel like that?\"",
      "Take turns; let them invent scenarios too.",
    ],
    materials: ["Just you"],
    category: "social",
    benefit:
      "Reading body language and linking situations to feelings builds empathy and theory of mind.",
    ageMinMonths: 48,
    ageMaxMonths: 78,
    isPremium: true,
  },
];

async function main() {
  console.log(`Seeding ${activities.length} activities…`);
  for (const a of activities) {
    const { steps, materials, ...rest } = a;
    await prisma.activity.upsert({
      where: { slug: a.slug },
      update: {
        ...rest,
        steps: JSON.stringify(steps),
        materials: JSON.stringify(materials),
      },
      create: {
        ...rest,
        steps: JSON.stringify(steps),
        materials: JSON.stringify(materials),
      },
    });
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
